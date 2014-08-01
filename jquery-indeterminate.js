/*! jquery-indeterminate.js
 *
 * Authored by: Cory Dorning
 * Website: http://corydorning.com/projects/indeterminate
 * Source: https://github.com/corydorning/indeterminate
 *
 * Dependencies: jQuery v1.8+
 *
 * Last modified by: Cory Dorning
 * Last modified on: 12/13/2012
 *
 * Indeterminate is a jQuery plugin that updates checkboxes based on the
 * parent/child relationship. If a parent checkbox checked/unchecked, all
 * children subsequently become checked/unchecked. If a child checkbox is
 * checked the parent becomes an indeterminate checkbox if ALL child checkboxes
 * are not checked.
 *
 */

;(function($) {
  "use strict";

  $.fn.indeterminate = function(options) {
        // set defaults
    var defaults = {
          label: false // checkbox contained within label (true/false)
        },

        // overwrite default options with those set
        settings = $.extend(defaults, options),

        // original jQuery object
        $container = this;

    // don't be the weakest link ( return to preserve chainability)
    // add change event to all checkboxes
    return $container.each(function() {
      var $set = $(this),

          // check for label container
          label = $set.data('label') || settings.label,

          setState = function() {
            // checked?
            var $this = $(this),

            checked = $this.prop('checked'),

            // get parent container
            $parent = $this.closest('li'),

            // check if checkbox parent is a part of the set
            setCheck = function($el) {
              // if element parent
              if (!$set.is($el.parent())) {
                // check parents siblings
                siblingCheck($el);
              }

            },

            // recursive sibling check
            siblingCheck = function($el) {
              // current checkbox parent
              var $currParent = $el.parent().parent(),

              // check for label and get current child checkboxes
                $currChildren = label ? $currParent.children('label').children(':checkbox') : $currParent.children(':checkbox'),

              // assume siblings match current checkbox
                matched = true;

              // check if sibling checkboxes match
              $el.siblings().each(function() {
                // check for label and get sibling child checkboxes
                var $sibling = label ? $(this).children('label') : $(this);

                // update match variable
                matched = $sibling.children(':checkbox').prop('checked') === checked;

                // keep going if they match
                return matched;

              }); // end loop

              if (matched && checked) { // if siblings and checkbox are checked

                // set parent to checked
                $currChildren.prop({
                  checked: checked,
                  indeterminate: false
                });

                // check if current parent is contained within the set
                setCheck($currParent);

              } else if (matched && !checked) { // if siblings and checkbox are unchecked

                // set parent to unchecked
                $currChildren.prop({
                  checked: checked,
                  indeterminate: ($currParent.children('ul').find(':checked').length > 0)
                });

                // check if current parent is contained within the set
                setCheck($currParent);

              } else { // some checked/unchecked
                // check for label and get checkbox ancestors within the set
                var $ancestors = label ? $el.parentsUntil($set).children('label') : $el.parentsUntil($set);

                // set ancestors to indeterminate
                $ancestors.children(':checkbox').prop({
                  checked: false,
                  indeterminate: true
                });

              } // end if matched && checked

            }; // end siblingCheck

            // set all child checkboxes to match parent
            $parent.find(':checkbox').prop({
              checked: checked,
              indeterminate: false
            });
            console.log(this);
            // check if current parent is contained within the set
            setCheck($parent);
          }; // setState


        $set
          .find(':checkbox')
            // add change event to checkboxes within the set
            .change(setState)
          // get checked on init, trigger change event to set state
          .filter(':checked')
            .each(function() { $(this).trigger('change'); });
    });

  };
})(jQuery);