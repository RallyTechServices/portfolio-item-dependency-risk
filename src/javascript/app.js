/* global Ext MetricsManager Constants Rally _ */
Ext.define("CArABU.app.TSApp", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    defaults: { margin: 10 },
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    integrationHeaders: {
        name: "CArABU.app.TSApp"
    },

    launch: function() {
        var modelNames = ['portfolioitem/feature'];
        var context = this.getContext();

        Ext.create('Rally.data.wsapi.TreeStoreBuilder').build({
            models: modelNames,
            autoLoad: false,
            enableHierarchy: true,
            listeners: {
                scope: this,
                load: function(store, node, records) {
                    MetricsManager.addMetrics(records);
                }
            },
            fetch: Constants.PORTFOLIO_ITEM_FETCH_FIELDS
        }).then({
            success: function(store) {
                this.add({
                    xtype: 'rallygridboard',
                    context: this.getContext(),
                    modelNames: modelNames,
                    toggleState: 'grid',
                    plugins: [{
                            ptype: 'rallygridboardinlinefiltercontrol',
                            inlineFilterButtonConfig: {
                                stateful: true,
                                stateId: context.getScopedStateId('feature-filters'),
                                modelNames: modelNames,
                                inlineFilterPanelConfig: {
                                    quickFilterPanelConfig: {
                                        defaultFields: [
                                            'ArtifactSearch',
                                            'Owner',
                                            'State'
                                        ]
                                    }
                                }
                            }
                        },
                        {
                            ptype: 'rallygridboardfieldpicker',
                            headerPosition: 'left',
                            modelNames: modelNames,
                            stateful: true,
                            stateId: context.getScopedStateId('feature-columns')
                        }
                    ],
                    gridConfig: {
                        store: store,
                        enabledEditing: true,
                        shouldShowRowActionsColumn: true,
                        enableRanking: false,
                        enableBulkEdit: false,
                        alwaysShowDefaultColumns: false, // Otherwise you get 2 copies of the `derived` columns
                        stateful: true,
                        stateId: context.getScopedStateId('grid-state'),
                        listeners: {
                            scope: this,
                            cellclick: function(grid, td, cellIndex, record, tr, rowIndex, event) {
                                // If this is a status color cell, show the dependencies popover
                                if (Ext.query('.' + Constants.CLASS.STATUS_COLORS, td).length > 0) {
                                    var popover = Rally.ui.popover.PopoverFactory.bake({
                                        field: 'PredecessorsAndSuccessors',
                                        record: record,
                                        target: td
                                    });
                                }
                            }
                        },
                        columnCfgs: this.getColumns(),
                        derivedColumns: this.getDerivedColumns()
                    },
                    height: this.getHeight()
                });
            },
            scope: this
        });
    },

    getColumns: function() {
        // TODO (tj) are derived columns needed in getColumns...or perhaps override can detect
        // a derived column in the normal column list
        return [
            'Name',
        ].concat(this.getDerivedColumns());
    },
    getDerivedColumns: function() {
        return [{
                dataIndex: 'PredecessorsStoryCountColorSortKey',
                text: 'Predecessors By Story Count',
                width: 100,
                //tpl: '<span><tpl for="PredecessorsStoryCountColors"><span class="{[ values.label.toLowerCase().replace(" ","-") ]}">{count}</span></tpl></span>',
                scope: this,
                renderer: function(value, meta, record, row, col, store) {
                    return this.colorsRenderer(record.get('PredecessorsStoryCountColors'));
                }
            },
            {
                dataIndex: 'PredecessorsPlanEstimateColorSortKey',
                text: 'Predecessors By Plan Estimate',
                scope: this,
                width: 100,
                renderer: function(value, meta, record, row, col, store) {
                    return this.colorsRenderer(record.get('PredecessorsPlanEstimateColors'));
                }
            },
            {
                dataIndex: 'SuccessorsStoryCountColorSortKey',
                text: 'Successors By Story Count',
                scope: this,
                width: 100,
                renderer: function(value, meta, record, row, col, store) {
                    return this.colorsRenderer(record.get('SuccessorsStoryCountColors'));
                }
            },
            {
                dataIndex: 'SuccessorsPlanEstimateColorSortKey',
                text: 'Successors By Plan Estimate',
                scope: this,
                width: 100,
                renderer: function(value, meta, record, row, col, store) {
                    return this.colorsRenderer(record.get('SuccessorsPlanEstimateColors'));
                }
            }
        ];
    },
    colorsRenderer: function(sortedColors) {
        //return '<span><tpl for="SuccessorsPlanEstimateColors"><span class="{[ values.label.toLowerCase().replace(" ","-") ]}">{count}</span></tpl></span>';
        var nonZeroColors = _.filter(sortedColors,
            function(color) {
                return color.count > 0;
            });
        var result = _.map(nonZeroColors, function(color) {
            var colorClass = color.label.toLowerCase().replace(" ", "-");
            return '<div class="' + Constants.CLASS.STATUS_COLOR_PREFIX + ' ' + colorClass + '">' + color.count + '</div>'
        });
        return '<div class="' + Constants.CLASS.STATUS_COLORS + '">' + result.join('') + '</div>'
    }
});
