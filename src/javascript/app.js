/* global Ext MetricsManager Constants */
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

        this.add({
            xtype: 'rallygrid',
            storeConfig: {
                model: 'portfolioitem/feature',
                autoLoad: true,
                listeners: {
                    scope: this,
                    load: function(store, records) {
                        MetricsManager.addMetrics(records);
                    }
                },
                fetch: Constants.PORTFOLIO_ITEM_FETCH_FIELDS
            },
            columnCfgs: [
                'Name',
                {
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
                    text: 'PredecessorsStoryCountColors',
                    tpl: '<span><tpl for="PredecessorsStoryCountColors"><span class="{[ values.label.toLowerCase().replace(" ","-") ]}">{count}</span></tpl></span>',
                },
                {
                    xtype: 'templatecolumn',
                    //dataIndex: 'PredecessorsPlanEstimateColorSortKey',
                    text: 'PredecessorsPlanEstimateColors',
                    tpl: '<span><tpl for="PredecessorsPlanEstimateColors"><span class="{[ values.label.toLowerCase().replace(" ","-") ]}">{count}</span></tpl></span>',
                },
                {
                    xtype: 'templatecolumn',
                    //dataIndex: 'SuccessorsStoryCountColorSortKey',
                    text: 'SuccessorsStoryCountColors',
                    tpl: '<span><tpl for="SuccessorsStoryCountColors"><span class="{[ values.label.toLowerCase().replace(" ","-") ]}">{count}</span></tpl></span>',
                },
                {
                    xtype: 'templatecolumn',
                    //dataIndex: 'SuccessorsPlanEstimateColorSortKey',
                    text: 'SuccessorsPlanEstimateColors',
                    tpl: '<span><tpl for="SuccessorsPlanEstimateColors"><span class="{[ values.label.toLowerCase().replace(" ","-") ]}">{count}</span></tpl></span>',
                }
            ]
        });
        /*
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
                    xtype: 'rallygrid',
                    context: this.getContext(),
                    modelNames: modelNames,
                    toggleState: 'grid',
                    //stateful: false,
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
                            stateful: false,
                            stateId: context.getScopedStateId('feature-columns')
                        }
                    ],
                    gridConfig: {
                        store: store,
                        //stateful: false,
                        columnCfgs: [
                            'Name',
                            'ScheduleState'
                            {
                                xtype: 'templatecolumn',
                                text: 'Predecessors',
                                tpl: '{PredecessorCount}'
                            },
                            {
                                xtype: 'templatecolumn',
                                text: 'Successors',
                                tpl: '{SuccessorCount}'
                            }
                        ]
                    },
                    height: this.getHeight()
                });
            },
            scope: this
        });
        */
    }
});
