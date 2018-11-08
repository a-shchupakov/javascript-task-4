'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;

function isSubEvent(event, subEvent) {
    return event.startsWith(`${subEvent}.`) ||
           event === subEvent;
}

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    return {
        listenedEvents: {},

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} repeat
         * @returns {Object} this
         */
        on: function (event, context, handler, repeat = Infinity) {
            if (!this.listenedEvents[event]) {
                this.listenedEvents[event] = [];
            }
            this.listenedEvents[event].push({ context, handler, repeat });

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object} this
         */
        off: function (event, context) {
            Object.keys(this.listenedEvents).forEach(function (eventName) {
                const doesEventMatch = isSubEvent(eventName, event);

                if (doesEventMatch) {
                    this.listenedEvents[eventName] = this.listenedEvents[eventName]
                        .filter(subscription => subscription.context !== context);

                    // Если на событие никто не подписан, удалим его целиком
                    if (this.listenedEvents[eventName].length === 0) {
                        this.listenedEvents[eventName] = undefined;
                    }
                }
            }, this);

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object} this
         */
        emit: function (event) {
            const subscriptions = this.listenedEvents[event];
            if (subscriptions) {
                subscriptions
                    .filter(subscription => subscription.repeat > 0)
                    .forEach(function (subscription) {
                        subscription.handler.apply(subscription.context);
                        subscription.repeat--;
                    });
            }

            const dotIndex = event.lastIndexOf('.');
            if (dotIndex !== -1) {
                this.emit(event.substring(0, dotIndex));
            }

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object} this
         */
        several: function (event, context, handler, times) {
            times = times <= 0 ? Infinity : times;
            this.on(event, context, handler, times);

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object} this
         */
        through: function (event, context, handler, frequency) {
            if (frequency > 0) {
                let counter = 0;
                const newHandler = function () {
                    if (counter++ % frequency === 0) {
                        handler.apply(this);
                    }
                };
                this.on(event, context, newHandler);

                return this;
            }

            this.on(event, context, handler);

            return this;
        }
    };
}

module.exports = {
    getEmitter,

    isStar
};
