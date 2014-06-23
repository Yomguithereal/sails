module.exports = function(sails) {

  /**
   * Module dependencies.
   */

  var _ = require('lodash'),
    Hook = require('../../index'),
    i18n = require('i18n'),
    domain = require('domain'),
    fs = require('fs'),
    path = require('path');


  /**
   * Expose hook definition
   */

  return {

    defaults: {
      // i18n
      i18n: {
        locales: ['en', 'es'],
        defaultLocale: 'en',
        localesDirectory: '/config/locales'
      }
    },

    routes: {

      before: {

        '/*': function(req, res, next) {

          i18n.init(req, res, function() {
            res.locals.i18n = res.i18n = res.__;
            next();
          });

        },
      }
    },

    initialize: function(cb) {



      domain.create()

      // Catch
      .on('error', function(err) {
        sails.log.error(err);
      })

      // Try
      .run(function() {


        // don't like this, but....
        // each plugin
        (sails.config.paths.plugins).forEach(function(pluginPath) {
          // sails.log.debug("Reading plugin: " + pluginPath);
          // each language
          (sails.config.i18n.locales).forEach(function(lang) {
            // check file exist
            var localPluginPath = pluginPath + '/config/locales/' + lang + '.json';
            fs.exists(localPluginPath, function(exists) {
              if (exists) {
                // sails.log.debug("Detect file: " + localPluginPath);
                // open app local file
                var appLocalPath = sails.config.appPath + '/config/locales/' + lang + '.json';
                fs.readFile(appLocalPath, 'utf8', function(err, fileApp) {
                  // console.log(JSON.parse(fileApp));
                  // open plugin local file
                  fs.readFile(localPluginPath, 'utf8', function(err, filePlugin) {
                    // Compose the final file
                    var data = JSON.stringify(_.assign(JSON.parse(fileApp), JSON.parse(filePlugin)), null, 2);
                    fs.writeFile(appLocalPath, data, "utf8", function(err) {
                      if (err) throw err;
                      // sails.log.debug('It\'s saved!');
                    });
                  });
                });
              }
            });
          });
        });

        i18n.configure(_.defaults(sails.config.i18n, {
          cookie: null,
          // directory: ([sails.config.appPath, sails.config.paths.plugins]).map(function(m) {
          //   return m + sails.config.i18n.localesDirectory;
          // }),
          directory: sails.config.appPath + sails.config.i18n.localesDirectory,
          // directory: sails.config.paths.plugins + sails.config.i18n.localesDirectory,
          updateFiles: false,
          extension: '.json'
        }));

        // Expose global access to locale strings
        sails.__ = i18n.__;
      });

      // Finally
      cb();
    }

  };
};
