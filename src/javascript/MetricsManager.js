/* global Ext _ Rally */
Ext.define('MetricsManager', function(MetricsManager) {
    return {
        statics: {
            addMetrics: addMetrics,
            STATUS_LABEL_ORDER: [{
                    label: 'Late',
                    hex: '#F66349',
                    count: 0
                },
                {
                    label: 'At Risk',
                    hex: '#FAD200',
                    count: 0
                },
                {
                    label: 'Not Started',
                    hex: '#E0E0E0',
                    count: 0
                },
                {
                    label: 'On Track',
                    hex: '#8DC63F',
                    count: 0
                },
                {
                    label: 'Complete',
                    hex: '#D1D1D1',
                    count: 0
                }
            ]
        }
    }

    function addMetrics(records) {
        _.forEach(records, function(record) {
            if (record.get('_type') != 'portfolioitem/feature') {
                return
            }

            var predecessorsRef = record.get('Predecessors');
            var successorsRef = record.get('Successors');
            if (predecessorsRef.Count > 0) {
                record
                    .getCollection('Predecessors')
                    .load()
                    .then(function(predecessors) {
                        record.set('PredecessorCount', predecessors.length);
                        var storyCountColors = {};
                        var planEstimateColors = {};
                        _.forEach(predecessors, function(item) {
                            var color;
                            color = Rally.util.HealthColorCalculator.calculateHealthColorForPortfolioItemData(item, 'PercentDoneByStoryCount');
                            var colorKey = color.label;
                            if (!storyCountColors[color.label]) {
                                color.count = 1;
                                storyCountColors[color.label] = color;
                            }
                            else {
                                storyCountColors[color.label].count += 1;
                            }

                            Rally.util.HealthColorCalculator.calculateHealthColorForPortfolioItemData(item, 'PercentDoneByStoryPlanEstimate');
                            color = Rally.util.HealthColorCalculator.calculateHealthColorForPortfolioItemData(item, 'PercentDoneByStoryCount');
                            colorKey = color.label;
                            if (!planEstimateColors[color.label]) {
                                color.count = 1;
                                planEstimateColors[color.label] = color;
                            }
                            else {
                                planEstimateColors[color.label].count += 1;
                            }
                        });
                        splitColors(record, storyCountColors, 'Predecessors', 'StoryCount');
                        splitColors(record, planEstimateColors, 'Predecessors', 'PlanEstimate');
                    });
            }

            if (successorsRef.Count > 0) {
                record
                    .getCollection('Successors')
                    .load()
                    .then(function(successors) {
                        record.set('SuccessorCount', successors.length);
                        var storyCountColors = {};
                        var planEstimateColors = {};
                        _.forEach(successors, function(item) {
                            var color;
                            color = Rally.util.HealthColorCalculator.calculateHealthColorForPortfolioItemData(item, 'PercentDoneByStoryCount');
                            var colorKey = color.label;
                            if (!storyCountColors[colorKey]) {
                                color.count = 1;
                                storyCountColors[colorKey] = color;
                            }
                            else {
                                storyCountColors[colorKey].count += 1;
                            }

                            Rally.util.HealthColorCalculator.calculateHealthColorForPortfolioItemData(item, 'PercentDoneByStoryPlanEstimate');
                            color = Rally.util.HealthColorCalculator.calculateHealthColorForPortfolioItemData(item, 'PercentDoneByStoryCount');
                            colorKey = color.label;
                            if (!planEstimateColors[colorKey]) {
                                color.count = 1;
                                planEstimateColors[colorKey] = color
                            }
                            else {
                                planEstimateColors[colorKey].count += 1;
                            }
                        });
                        splitColors(record, storyCountColors, 'Successors', 'StoryCount');
                        splitColors(record, planEstimateColors, 'Successors', 'PlanEstimate');
                    });
            }
        });
    }

    function splitColors(record, colors, relation, metric) {
        var sortedColors = [];
        _.forEach(MetricsManager.STATUS_LABEL_ORDER, function(statusLabel) {
            sortedColors.push(colors[statusLabel.label] ? colors[statusLabel.label] : statusLabel);
        });
        record.set(relation + metric + 'Colors', sortedColors);
        record.set(relation + metric + 'ColorSortKey', _.pluck(sortedColors, 'count').join('+'));
    }
});
