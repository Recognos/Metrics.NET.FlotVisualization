(function ($, _) {
    'use strict';

    function HealthMonitor($timeout, $http, endpoint, configService) {
        var self = this,
            config = configService.healthConfig(),
            timer = null;

        function mapSection(section) {
            return _(section).map(function (h, key) {
                return { name: key, text: h };
            }).value();
        }

        function updateStatus(callback) {
            var healthUri = 'health';
            if (endpoint) {
                if (endpoint[endpoint.length - 1] === '/') {
                    healthUri = endpoint + healthUri;
                } else {
                    healthUri = endpoint + '/' + healthUri;
                }
            }

            $http.get(healthUri).success(function (data) {
                callback(data);
            }).error(function (data, status) {
                if (status === 500 && _(data).isObject() && data.IsHealthy === false) {
                    callback(data);
                } else {
                    self.updateError = 'Error reading Health Status data from ' + (endpoint || '') + '/health. Update stopped.';
                }
            });
        }

        function update(status) {
            self.updateError = null;
            self.isHealthy = status.IsHealthy;
            self.unhealthy = mapSection(status.Unhealthy);
            self.healthy = mapSection(status.Healthy);
            if (config.interval > 0) {
                if (timer !== null) {
                    $timeout.cancel(timer);
                }
                timer = $timeout(function () { updateStatus(update); }, config.interval);
            }
        }

        this.isHealthy = true;
        this.unhealthy = [];
        this.healthy = [];
        this.updateError = null;

        this.retry = function () {
            updateStatus(update);
        };

        this.updateInterval = function (interval) {
            if (interval !== undefined) {
                config.interval = interval;
                configService.healthConfig(config);
                updateStatus(update);
            }
            return config.interval;
        };

        updateStatus(update);
    }

    $.extend(true, this, { metrics: { HealthMonitor: HealthMonitor } });

}).call(this, this.jQuery, this._);