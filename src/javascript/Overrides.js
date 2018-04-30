/* global Ext Rally _ */

/*
    Without these overrides columns are Stripped by Rally.ui.grid.GridColumnCfgTransformer if dataIndex of column is not in the model
    model comes from the store model (see _buildColumns). The tree store builder creates a composite
    model for portfolio items that include all possible child types (stories, tasks, defects, etc),
    however _decorateModels override doesn't decorate the composite model, only the sub-model.
    Alternatively, GridColumnCfgTransformer.transform should check models.getArtifactComponentModels when
    determining invalid fields. Need to check the tree store sort to see which model it sorts (the composite,
    or each individual...)
    
    Sort is based on column.getSortParam() which calls store.sort(). Store.model is the composite `Artifact`
    model.
    
    Options:
    * doSort includes a `fn` in the config to store.sort() to allow a per-column sort function, or pass a
    function instead of a config (see decodeSorters)
    * consider model.field.sortType
    * listen to 'beforesort'
    * get the extra fields into the composite model
    
    _removeSortableFromUnsortableColumns (my new column.sortable=undefined), is true by end of _augmentColumnConfigs
*/

Ext.override(Rally.data.wsapi.TreeStore, {
    _decorateModels: function() {
        var models = this.model;

        // Must add it to composite model otherwise any column with a dataIndex will be excluded
        this.addExtraFields(models);

        if (_.isFunction(models.getArtifactComponentModels)) {
            models = models.getArtifactComponentModels();
        }

        Ext.Array.each(models, function(m) {
            if (m.typePath.indexOf("portfolioitem/") != -1) {
                //m.addField({ name: 'ToDo', type: 'auto', defaultValue: 0, modelType: m.typePath });
                // TODO (tj) modelType used anywhere?
                this.addExtraFields(m)
            }
        }, this);
        _.each(Ext.Array.from(models), Rally.ui.grid.data.NodeInterface.decorate, Rally.ui.grid.data.NodeInterface);
    },

    addExtraFields: function(model) {
        model.addField({ name: 'PredecessorsStoryCountColorSortKey', type: 'string', defaultValue: '', modelType: model.typePath, });
        model.addField({ name: 'PredecessorsPlanEstimateColorSortKey', type: 'string', defaultValue: '', modelType: model.typePath, });
        model.addField({ name: 'SuccessorsStoryCountColorSortKey', type: 'string', defaultValue: '', modelType: model.typePath, });
        model.addField({ name: 'SuccessorsPlanEstimateColorSortKey', type: 'string', defaultValue: '', modelType: model.typePath, });
    }
});

Ext.override(Rally.ui.grid.TreeGrid, {
    _mergeColumnConfigs: function(newColumns, oldColumns) {

        var mergedColumns = _.map(newColumns, function(newColumn) {
            var oldColumn = _.find(oldColumns, { dataIndex: this._getColumnName(newColumn) });
            if (oldColumn) {
                return this._getColumnConfigFromColumn(oldColumn);
            }

            return newColumn;
        }, this);
        mergedColumns = mergedColumns.concat(this.config.derivedColumns);
        return mergedColumns;
    },
    _restoreColumnOrder: function(columnConfigs) {

        var currentColumns = this._getColumnConfigsBasedOnCurrentOrder(columnConfigs);
        var addedColumns = _.filter(columnConfigs, function(config) {
            return !_.find(currentColumns, { dataIndex: config.dataIndex }) || Ext.isString(config);
        });

        return currentColumns.concat(addedColumns);
    },
    _applyStatefulColumns: function(columns) {
        if (this.alwaysShowDefaultColumns) {
            _.each(this.columnCfgs, function(columnCfg) {
                if (!_.any(columns, { dataIndex: this._getColumnName(columnCfg) })) {
                    columns.push(columnCfg);
                }
            }, this);
        }
        if (this.config && this.config.derivedColumns) {
            this.columnCfgs = columns.concat(this.config.derivedColumns);
        }
        else {
            this.columnCfgs = columns;
        }
    }
});
