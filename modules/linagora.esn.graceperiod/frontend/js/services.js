'use strict';

angular.module('linagora.esn.graceperiod')

  .factory('gracePeriodAPI', function(Restangular) {
    return Restangular.withConfig(function(RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl('/graceperiod/api');
      RestangularConfigurer.setFullResponse(true);
    });
  })

  .factory('gracePeriodService', function(gracePeriodAPI, notifyOfGracedRequest) {
    function cancel(id) {
      return gracePeriodAPI.one('tasks').one(id).remove();
    }

    return {
      grace: notifyOfGracedRequest,
      cancel: cancel
    };
  })

  .factory('notifyOfGracedRequest', function(GRACE_DELAY, ERROR_DELAY, $q, $rootScope) {
    function appendCancelLink(text, linkText) {
      return text + ' <a class="cancel-task">' + linkText + '</a>';
    }

    return function(text, linkText, delay) {
      return $q(function(resolve) {
        var notification = $.notify({
          message: appendCancelLink(text, linkText)
        }, {
          type: 'success',
          text: appendCancelLink(text, linkText),
          placement: {
            from: 'bottom',
            align: 'center'
          },
          delay: delay || GRACE_DELAY,
          onClosed: function() {
            $rootScope.$apply(function() {
              resolve({ cancelled: false });
            });
          }
        });

        notification.$ele.find('a.cancel-task').click(function() {
          $rootScope.$apply(function() {
            resolve({
              cancelled: true,
              success: function() {
                notification.close();
              },
              error: function(errorMessage) {
                notification.update({
                  type: 'danger',
                  message: errorMessage,
                  delay: ERROR_DELAY
                });
              }
            });
          });
        });
      });
    };
  });