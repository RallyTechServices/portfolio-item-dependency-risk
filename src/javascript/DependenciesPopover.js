/* global Ext */

/**
 * Based on Rally.ui.popover.DependenciesPopover
 */
(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * Create a popover to display a tabbed view of dependencies on a work item.
     *
     *     Rally.ui.popover.PopoverFactory.bake({
     *         field: 'Dependencies'
     *     });
     */
    Ext.define('DependenciesPopover', {
        alias: 'widget.tsdependenciespopover',
        extend: 'Rally.ui.popover.Popover',
        requires: [
            'Rally.nav.DetailLink'
        ],

        id: 'dependencies-popover',
        cls: 'dependenciesPopover',

        width: 400,
        maxHeight: 380,
        titleIconCls: 'icon-predecessor',
        title: 'Dependencies',
        percentDoneField: 'PercentDoneByStoryCount',

        fetchFields: {
            hierarchicalrequirement: ['Name', 'FormattedID', 'ScheduleState', 'Iteration', 'Blocked'],
            portfolioitem: ['Name', 'FormattedID', 'Release', 'State', 'PercentDoneByStoryCount', 'PercentDoneByStoryPlanEstimate']
        },

        rowTpl: undefined,

        countTpl: Ext.create('Ext.XTemplate',
            '<div class="dependency-row">',
            'Showing {displayed} of {total} {fieldName} of {id}. {[this.getLinkContent(values.record, values.isEdpEnabled)]}',
            '</div>', {
                getLinkContent: function(record, isEdpEnabled) {
                    if (isEdpEnabled) {
                        return Rally.nav.DetailLink.getLink({
                            record: record,
                            subPage: 'dependencies',
                            text: 'Go to Dependencies.'
                        });
                    }
                    return '';
                }
            }
        ),

        constructor: function(config) {
            var numPredecessors = config.record.get('PredecessorsAndSuccessors').Predecessors;
            var numSuccessors = config.record.get('PredecessorsAndSuccessors').Successors;
            // 0 for Precessors tab, 1 for Successors tab
            var activeTab = numPredecessors === 0 && numSuccessors > 0 ? 1 : 0;
            if (!_.isUndefined(config.activeTab)) {
                activeTab = config.activeTab;
            }
            config.items = [{
                xtype: 'tabpanel',
                activeTab: activeTab,
                items: [{
                        title: 'Predecessors',
                        html: 'Loading...',
                        tabConfig: {
                            width: 160
                        }
                    },
                    {
                        title: 'Successors',
                        html: 'Loading...',
                        tabConfig: {
                            width: 160
                        }
                    }
                ],
                listeners: {
                    afterRender: this._onAfterRender,
                    tabChange: this._onAfterRender,
                    scope: this
                }
            }];

            this.loaded = {};
            this.callParent(arguments);
            this.rowTpl = this.getRowTemplate();
        },

        destroy: function() {
            this._destroyTooltip();
            this.callParent(arguments);
        },

        getRowTemplate: function() {
            var me = this;
            return Ext.create('Ext.XTemplate',
                '<div class="dependency-row">',
                '<div class="identifier">',
                '{[this.getFormattedIdTemplate(values.data)]} <span class="object-name dependency-title">{[this.trimText(values.data, 40, "")]}</span>',
                '</div>',
                '<div class="status">',
                '<tpl if="this.isUserStory(values)">',
                '{[this.getScheduleState(values)]}',
                '</div>',
                '<span class="field-label">Iteration:</span> <span class="object-name iteration">{[this.trimText(values.data.Iteration, 25, "Unscheduled")]}</span>',
                '<tpl else>',
                '<div class="percent-done-wrapper">{[this.getPercentDone(values)]}</div>',
                '</div>',
                '<tpl if="this.hasReleaseAttr(values.data)">',
                '<span class="field-label">Release:</span>  <span class="object-name release">{[this.trimText(values.data.Release, 25, "Unscheduled")]}</span>',
                '<tpl else>',
                '<span>&nbsp;</span>',
                '</tpl>',
                '</tpl>',
                '</div>', {
                    isUserStory: function(record) {
                        return record.tplType === 'hierarchicalrequirement';
                    },
                    getFormattedIdTemplate: function(data) {
                        return Ext.create('Rally.ui.renderer.template.FormattedIDTemplate', {
                            showIcon: true,
                            showHover: false
                        }).apply(data);
                    },
                    getScheduleState: function(record) {
                        return Ext.create('Rally.ui.renderer.template.ScheduleStateTemplate', {
                            field: record.getField('ScheduleState')
                        }).apply(record.data);
                    },
                    getPercentDone: function(record) {
                        if (me.percentDoneField === 'PercentDoneByStoryCount') {
                            return Ext.create('Rally.ui.renderer.template.progressbar.PercentDoneByStoryCountTemplate', {
                                field: record.getField('PercentDoneByStoryCount'),
                                record: record
                            }).apply(record.data);
                        }
                        else if (me.percentDoneField === 'PercentDoneByStoryPlanEstimate') {
                            return Ext.create('Rally.ui.renderer.template.progressbar.PercentDoneByStoryPlanEstimateTemplate', {
                                field: record.getField('PercentDoneByStoryPlanEstimate'),
                                record: record
                            }).apply(record.data);
                        }
                    },
                    trimText: function(data, max, defaultValue) {
                        return data && data.Name ? Ext.String.ellipsis(data.Name, max) : defaultValue;
                    },
                    hasReleaseAttr: function(data) {
                        return data.hasOwnProperty('Release');
                    }
                }
            )
        },

        _onAfterRender: function() {
            var tabTitle = this._getTabPanel().getActiveTab().title;
            if (!this.loaded[tabTitle]) {
                this.loaded[tabTitle] = true;
                this._loadData(tabTitle);
            }
            else if (Rally.BrowserTest) {
                Rally.BrowserTest.publishComponentReady(this);
            }
        },

        _loadData: function(tabTitle) {
            this.record.getCollection(tabTitle, {
                fetch: this.fetchFields[this._getType(this.record)],
                requester: this
            }).load({
                callback: this._onDataRetrieved,
                scope: this
            });
        },

        _onDataRetrieved: function(items) {
            Rally.data.detail.DetailPagePreference.isDetailPageEnabled('userstory', function(isEnabled) {
                this.isEdpEnabled = isEnabled;
                this._getTabPanel().getActiveTab().update(this._buildContent(items));
                this._addTooltip();

                if (Rally.BrowserTest) {
                    Rally.BrowserTest.publishComponentReady(this);
                }
            }, this);
        },

        _buildContent: function(items) {
            var html = [],
                fieldName = this._getTabPanel().getActiveTab().title;

            _.each(items, function(item) {
                item.tplType = this._getType(items[0]);
                html.push(this.rowTpl.apply(item));
            }, this);

            html.push(this.countTpl.apply({
                total: this.record.get('PredecessorsAndSuccessors')[fieldName],
                displayed: items.length,
                fieldName: fieldName.toLowerCase(),
                id: this.record.get('FormattedID'),
                isEdpEnabled: this.isEdpEnabled,
                record: this.record
            }));

            return '<div class="outer-container">' + html.join("\n") + '</div>';
        },

        _addTooltip: function() {
            var label;
            if (this.percentDoneField === 'PercentDoneByStoryCount') {
                label = '% Done by Story Count'
            }
            else if (this.percentDoneField === 'PercentDoneByStoryPlanEstimate') {
                label = '% Done by Story Plan Estimate'
            }
            this._destroyTooltip();
            this.tooltip = Ext.create('Rally.ui.tooltip.ToolTip', {
                target: this.getEl(),
                html: label,
                delegate: '.percent-done-wrapper',
                anchor: 'top',
                showDelay: 500
            });
        },

        _destroyTooltip: function() {
            if (this.tooltip) {
                this.tooltip.destroy();
            }
        },

        _getTabPanel: function() {
            return this.items.items[0];
        },

        _getType: function(record) {
            return record.get('_ref').replace(/^\//, '').split('/')[0];
        }
    });
})();
