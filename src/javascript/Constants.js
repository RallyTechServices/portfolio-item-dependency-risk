/* global Ext */
Ext.define('Constants', function(Constants) {
    return {
        statics: {
            PORTFOLIO_ITEM_FETCH_FIELDS: ['Predecessors', 'Successors'],
            CLASS: {
                PREDECESSORS: 'predecessors',
                SUCCESSORS: 'successors',
                STATUS_COLORS: 'status-colors',
                PERCENT_DONE_BY_STORY_COUNT: 'percent-done-by-story-count',
                PERCENT_DONE_BY_STORY_PLAN_ESTIMATE: 'percent-done-by-story-plan-estimate'
            }
        }
    }
});
