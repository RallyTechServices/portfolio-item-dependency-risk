/* global Ext MetricsManager Constants Rally */
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
                        enabledEditing: false,
                        shouldShowRowActionsColumn: false,
                        enableRanking: false,
                        enableBulkEdit: false,
                        listeners: {
                            scope: this,
                            itemclick: function(grid, record, item, index) {
                                var popover = Rally.ui.popover.PopoverFactory.bake({
                                    field: 'PredecessorsAndSuccessors',
                                    record: record,
                                    target: item
                                });
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
                xtype: 'templatecolumn',
                text: 'Predecessors',
                tpl: '{PredecessorCount}'
            },
            {
                xtype: 'templatecolumn',
                text: 'Successors',
                tpl: '{SuccessorCount}'
            },
            {
                xtype: 'templatecolumn',
                //dataIndex: 'PredecessorsStoryCountColorSortKey',
                text: 'Predecessors By Story Count',
                tpl: '<span><tpl for="PredecessorsStoryCountColors"><span class="{[ values.label.toLowerCase().replace(" ","-") ]}">{count}</span></tpl></span>',
            },
            {
                xtype: 'templatecolumn',
                //dataIndex: 'PredecessorsPlanEstimateColorSortKey',
                text: 'Predecessors By Plan Estimate',
                tpl: '<span><tpl for="PredecessorsPlanEstimateColors"><span class="{[ values.label.toLowerCase().replace(" ","-") ]}">{count}</span></tpl></span>',
            },
            {
                xtype: 'templatecolumn',
                //dataIndex: 'SuccessorsStoryCountColorSortKey',
                text: 'Successors By Story Count',
                tpl: '<span><tpl for="SuccessorsStoryCountColors"><span class="{[ values.label.toLowerCase().replace(" ","-") ]}">{count}</span></tpl></span>',
            },
            {
                xtype: 'templatecolumn',
                //dataIndex: 'SuccessorsPlanEstimateColorSortKey',
                text: 'Successors By Plan Estimate',
                tpl: '<span><tpl for="SuccessorsPlanEstimateColors"><span class="{[ values.label.toLowerCase().replace(" ","-") ]}">{count}</span></tpl></span>',
            }
        ];
    }
});
