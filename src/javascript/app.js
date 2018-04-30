/* global Ext MetricsManager Constants Rally _ */
Ext.define("CArABU.app.TSApp", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    defaults: { margin: 10 },
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items: [{
        xtype: 'tslegend'
    }],
    integrationHeaders: {
        name: "CArABU.app.TSApp"
    },

    launch: function() {
        var modelNames = ['portfolioitem/feature'];
        var context = this.getContext();

        // Register our version of the dependencies popover with the PopoverFactory
        Rally.ui.popover.PopoverFactory.popovers['TsDependenciesPopover'] = function(config) {
            return Ext.create('DependenciesPopover', this._getConfig(config));
        }

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
                                // TODO (tj) not a big fan of using CSS classes to determine column, but didn't
                                // see another way to get column from cellclick event?
                                if (Ext.query('.' + Constants.CLASS.STATUS_COLORS, td).length > 0) {
                                    var activeTab;
                                    var percentDoneField;
                                    if (this.elHasClass(td, Constants.CLASS.PREDECESSORS)) {
                                        activeTab = 0;
                                    }
                                    else if (this.elHasClass(td, Constants.CLASS.SUCCESSORS)) {
                                        activeTab = 1;
                                    }

                                    if (this.elHasClass(td, Constants.CLASS.PERCENT_DONE_BY_STORY_COUNT)) {
                                        percentDoneField = 'PercentDoneByStoryCount';
                                    }
                                    else if (this.elHasClass(td, Constants.CLASS.PERCENT_DONE_BY_STORY_PLAN_ESTIMATE)) {
                                        percentDoneField = 'PercentDoneByStoryPlanEstimate'
                                    }
                                    Rally.ui.popover.PopoverFactory.bake({
                                        field: 'TsDependenciesPopover',
                                        record: record,
                                        target: td,
                                        percentDoneField: percentDoneField,
                                        activeTab: activeTab
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

    elHasClass(element, cls) {
        return _.find(element.classList, function(c) {
            return c === cls
        })
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
                //width: 100,
                //tpl: '<span><tpl for="PredecessorsStoryCountColors"><span class="{[ values.label.toLowerCase().replace(" ","-") ]}">{count}</span></tpl></span>',
                scope: this,
                renderer: function(value, meta, record, row, col, store) {
                    return this.colorsRenderer(record.get('PredecessorsStoryCountColors'), Constants.CLASS.PERCENT_DONE_BY_STORY_COUNT);
                },
                sortable: true,
                tdCls: Constants.CLASS.PREDECESSORS + ' ' + Constants.CLASS.PERCENT_DONE_BY_STORY_COUNT
            },
            {
                dataIndex: 'PredecessorsPlanEstimateColorSortKey',
                text: 'Predecessors By Plan Estimate',
                scope: this,
                //width: 100,
                renderer: function(value, meta, record, row, col, store) {
                    return this.colorsRenderer(record.get('PredecessorsPlanEstimateColors'), Constants.CLASS.PERCENT_DONE_BY_STORY_PLAN_ESTIMATE);
                },
                sortable: true,
                tdCls: Constants.CLASS.PREDECESSORS + ' ' + Constants.CLASS.PERCENT_DONE_BY_STORY_PLAN_ESTIMATE
            },
            {
                dataIndex: 'SuccessorsStoryCountColorSortKey',
                text: 'Successors By Story Count',
                scope: this,
                //width: 100,
                renderer: function(value, meta, record, row, col, store) {
                    return this.colorsRenderer(record.get('SuccessorsStoryCountColors'), Constants.CLASS.PERCENT_DONE_BY_STORY_COUNT);
                },
                sortable: true,
                tdCls: Constants.CLASS.SUCCESSORS + ' ' + Constants.CLASS.PERCENT_DONE_BY_STORY_COUNT
            },
            {
                dataIndex: 'SuccessorsPlanEstimateColorSortKey',
                text: 'Successors By Plan Estimate',
                scope: this,
                //width: 100,
                renderer: function(value, meta, record, row, col, store) {
                    return this.colorsRenderer(record.get('SuccessorsPlanEstimateColors'), Constants.CLASS.PERCENT_DONE_BY_STORY_PLAN_ESTIMATE);
                },
                sortable: true,
                tdCls: Constants.CLASS.SUCCESSORS + ' ' + Constants.CLASS.PERCENT_DONE_BY_STORY_PLAN_ESTIMATE
            }
        ];
    },
    /**
     * sortedColors: Array of counts
     * cls: Extra class to add to the cell
     */
    colorsRenderer: function(sortedColors, cls) {
        var nonZeroColors = _.filter(sortedColors,
            function(color) {
                return color.count > 0;
            });
        var result = _.map(nonZeroColors, function(color) {
            var colorClass = color.label.toLowerCase().replace(" ", "-");
            return '<div class="status-color ' + colorClass + '">' + color.count + '</div>'
        });
        return '<div class="status-colors">' + result.join('') + '</div>'
    }
});
