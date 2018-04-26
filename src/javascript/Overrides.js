/* global Ext Rally _ */
Ext.override(Rally.data.wsapi.TreeStore, {
    _decorateModels: function() {
        var models = this.model;

        if (_.isFunction(models.getArtifactComponentModels)) {
            models = models.getArtifactComponentModels();
        }

        Ext.Array.each(models, function(m) {
            if (m.typePath.indexOf("portfolioitem/") != -1) {
                //m.addField({ name: 'ToDo', type: 'auto', defaultValue: 0, modelType: m.typePath });
                // TODO (tj) modelType used anywhere?
                m.addField({ name: 'PredecessorsStoryCountColorSortKey', type: 'string', defaultValue: '', modelType: m.typePath });
                m.addField({ name: 'PredecessorsPlanEstimateColorSortKey', type: 'string', defaultValue: '', modelType: m.typePath });
                m.addField({ name: 'SuccessorsStoryCountColorSortKey', type: 'string', defaultValue: '', modelType: m.typePath });
                m.addField({ name: 'SuccessorsPlanEstimateColorSortKey', type: 'string', defaultValue: '', modelType: m.typePath });
            }
            /*
            if (m.typePath.indexOf("hierarchicalrequirement") != -1) {
                m.addField({ name: 'Estimate', type: 'auto', defaultValue: 0, modelType: m.typePath });
                m.addField({ name: 'TimeSpent', type: 'auto', defaultValue: 0, modelType: m.typePath });
                m.addField({ name: 'ToDo', type: 'auto', defaultValue: 0, modelType: m.typePath });
                m.addField({ name: 'AcceptedLeafStoryPlanEstimateTotal', type: 'auto', defaultValue: 0, modelType: m.typePath });
                m.addField({ name: 'LeafStoryPlanEstimateTotal', type: 'auto', defaultValue: 0, modelType: m.typePath });
            }
            */
        });

        _.each(Ext.Array.from(models), Rally.ui.grid.data.NodeInterface.decorate, Rally.ui.grid.data.NodeInterface);
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
