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
            autoLoad: true,
            enableHierarchy: true
        }).then({
            success: function(store) {
                this.add({
                    xtype: 'rallygridboard',
                    context: this.getContext(),
                    modelNames: modelNames,
                    toggleState: 'grid',
                    plugins: [
                        //'rallygridboardtoggleable'
                        {
                            ptype: 'rallygridboardinlinefiltercontrol',
                            inlineFilterButtonConfig: {
                                stateful: true,
                                stateId: context.getScopedStateId('filters'),
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
                            stateId: context.getScopedStateId('columns')
                        }
                    ],
                    cardBoardConfig: {
                        attribute: 'ScheduleState'
                    },
                    gridConfig: {
                        store: store,
                        columnCfgs: [
                            'Name',
                            'ScheduleState',
                            'Owner',
                            'PlanEstimate'
                        ]
                    },
                    height: 500, // this.getHeight()
                    width: 500
                });
            },
            scope: this
        });
    }

});
