/*! jquery-indeterminate.js
 *
 * Authored by: Cory Dorning
 * Website: http://corydorning.com/projects/indeterminate
 * Source: https://github.com/corydorning/indeterminate
 *
 * Dependencies: jQuery v1.10+
 *
 * Last modified by: Cory Dorning
 * Last modified on: 11/12/2014
 *
 * Indeterminate is a jQuery plugin that updates checkboxes based on the
 * parent/child relationship. If a parent checkbox checked/unchecked, all
 * children subsequently become checked/unchecked. If a child checkbox is
 * checked the parent becomes an indeterminate checkbox if ALL child checkboxes
 * are not checked.
 *
 */

// include semicolon to make sure any JS before this plugin is terminated
;(function($) {
  "use strict";

  // create the plugin
  $.indeterminate = function(element, options) {

    // plugin's default options
    var defaults = {
        label: false // checkbox contained within label (true/false)
      }
      ,
    // reference to the actual DOM element
      sel = element
      ,
    // reference to the jQuery version of DOM element
      $sel = $(sel)
      ,
    // reference to the current instance of the object
      plugin = this
      ,
    // private methods
      _setState = {
        child: function($checkbox, state) {
          var $cbContainer = $checkbox.closest('li');

          $cbContainer.children('ul').find(':checkbox').prop({
            // set to parent state since it changed
            checked: state,

            // reset since parent was changed
            indeterminate: false
          });
        }, // _setState.child()

        parent: function($checkbox, state) {
          // current checkbox parent
          var checkbox = plugin.settings.label ? '> label > :checkbox': '> :checkbox'
            ,
            $cbContainer = $checkbox.closest('li')
            ,
            $cbParent = $cbContainer.parent($sel).not($sel).closest('li').find(checkbox)
            ,
            $cbSiblings = $cbContainer.siblings('li').find(checkbox)
            ,
            // assume all siblings match
            siblingsMatch = true
            ,
            // init to match current checkbox
            indeterminateState = $checkbox.prop('indeterminate')
            ;

          // check if sibling checkboxes match
          $cbSiblings.each(function() {
            var $currSibling = $(this)
            ;

            // if indeterminate state is true for any checkbox, keep it true
            indeterminateState = indeterminateState || $currSibling.prop('indeterminate');

            // as long as siblings checked state match, keep checking to make sure
            if(siblingsMatch) {
              siblingsMatch = $currSibling.prop('checked') === state;
            }
          });

          // siblings match and state is checked
          if (siblingsMatch) {
            // set parent to match siblings
            $cbParent
              .prop({
                checked: state,
                indeterminate: indeterminateState
              })
              // set childTrigger param to true so it doesn't
              // set child state since it's already been processed
              .trigger('change', true)
            ;

          } else {
            $cbParent
              .prop({
                checked: false,
                indeterminate: true
              })
              // set childTrigger param to true so it doesn't
              // set child state since it's already been processed
              .trigger('change', true)
            ;
          }
        } // _setState.parent()
      }
      ;

    // merge defaults and user-provided options (if any)
    // private: plugin.settings.propertyName
    // public: el.data('indeterminate').settings.propertyName
    plugin.settings = $.extend({}, defaults, options);


    // the "constructor" method that gets called when the plugin object is created
    plugin.init = function() {
      $sel
        // add delegated change event for checkboxes
        .on('change', ':checkbox', plugin.setStates)

        // needed for IE, since 'change' isn't triggered on indeterminate checkboxes
        .on('click', ':checkbox', function(el) {
          var $checkbox = $(el.target)
            ;

          $checkbox.trigger('change');
        })

        // find those initially checked and
        // trigger change to set state
        .find(':checked')
        .trigger('change')
      ;
    };


    plugin.setStates = function(checkbox, childTrigger) {
      var $checkbox = $(this),
        state = $checkbox.prop('checked')
        ;

      // set child state if not triggered from child
      if (!childTrigger) {
        _setState.child($checkbox, state);
      }

      // set parent state
      _setState.parent($checkbox, state);
    }; // plugin.setState()

    // start the plugin -  call the "constructor" method
    plugin.init();

  };

  // add the plugin to the jQuery.fn object
  $.fn.indeterminate = function(options) {

    // iterate through the DOM elements that match the selector
    return this.each(function() {
      // reference to the actual DOM element
      var curr = this
        ,
      // reference to the jQuery version of DOM element
        $curr = $(this)
        ,
      // merge user defaults and current element specific data-options (if any)
        settings = $.extend({}, options, $curr.data('options'))
        ;

      // plugin exist on this element?
      if (!$curr.data('indeterminate')) {
        // create a new instance of the plugin
        // pass the DOM element and the merged settings as arguments
        var plugin = new $.indeterminate(curr, settings);

        // store a reference to the plugin object which you can later access
        //  element.data('indeterminate').publicMethod(arg1, arg2, argN)
        //  element.data('indeterminate').settings.propertyName
        $curr.data('indeterminate', plugin);
      }

    });

  };

})(jQuery);
// end indeterminate