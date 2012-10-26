;JTE = (function() {
    /**
     * @page        http://github.com/Shushik/i-tmpl/
     * @author      Shushik <silkleopard@yandex.ru>
     * @version     1.0
     * @description Django or Jinja like template engine for JavaScript
     *
     * @static
     *
     * @this   {Tmpl}
     * @param  {string}
     * @param  {object}
     * @return {string}
     */
     function
        Tmpl(path, data) {
            return Tmpl.render(path, data);
        }

    /**
     * Indicator of development version
     *
     * @static
     *
     * @value {boolean}
     */
    Tmpl.dev = false;

    /**
     * List of tags functions
     *
     * @static
     *
     * @value {object}
     */
    Tmpl._tags = {};

    /**
     * List of templates
     *
     * @static
     * @private
     *
     * @value {object}
     */
    Tmpl._tmpls = {};

    /**
     * List of filter functions
     *
     * @static
     *
     * @value {object}
     */
    Tmpl._filters = {};

    /**
     * Set template, filter or tag
     *
     * @static
     *
     * @this   {Tmpl}
     * @param  {string}
     * @param  {string}
     * @param  {string|function}
     * @return {string}
     */
    Tmpl.set = function(type, alias, value) {
        var
            aliases = {
                tag      : '_tags',
                tpl      : '_tmpls',
                tmpl     : '_tmpls',
                filter   : '_filters',
                template : '_tmpls'
            };

        // Check if the type is available for saving
        if (aliases[type]) {
            if (aliases[type] == '_tmpl') {
                value = value
                        .replace(/([\n\r\t])/g, '')
                        .replace(/(['])/g, '\\$1');
            }

            Tmpl[aliases[type]] = value;
        }
    };

    /**
     * Render a given template using a given data object
     *
     * @static
     *
     * @this   {Tmpl}
     * @param  {string}
     * @param  {object}
     * @return {string}
     */
    Tmpl.render = function(path, data) {
        path = path || '';
        data = data || {};

        var
            tmpl     = '',
            compiled = '',
            executed = '';

        // Check if the template is available
        if (Tmpl._tmpls[path]) {
            tmpl = Tmpl._tmpls[path];
        } else {
            tmpl = '';
        }

        // Try to compile template
        tmpl = Tmpl._compile(tmpl, data);

        // Try to execute template
        tmpl = Tmpl._exe(tmpl, data);

        return tmpl;
    };

    /**
     * Compile the template
     *
     * @static
     * @private
     *
     * @this   {Tmpl}
     * @param  {string}
     * @param  {object}
     * @param  {boolean}
     * @return {undefined}
     */
    Tmpl._compile = function(tmpl, data, dry) {
        dry  = dry  || false;
        tmpl = tmpl || '';

        var
            pos     = 0,
            end     = 0,
            vars    = '',
            alias   = '',
            parse   = '',
            parser  = '',
            parsers = [
                'includes',
                'blocks',
                'modals',
                'cicles',
                'vars',
                'filters',
                'comments',
                'with',
                'tags'
            ];

        // Total number of parsers
        end = parsers.length;

        // Iterate the template through the parsers
        for (pos = 0; pos < end; pos++) {
            parser = Tmpl['_parse4' + parsers[pos]];
            //
            if (parser) {
                tmpl = parser(tmpl, data);
            }
        }

        // Compile a template variables
        for (alias in data) {
            vars += alias + "=data['" + alias + "'],";
        }

        // Don`t eval the template if it was called by the include
        if (dry) {
            return tmpl;
        }

        // The final code
        return ";(function(){var " + vars + "out='" + tmpl + "';return out;})();"
    };

    /**
     * Execute the compiled javascript code
     *
     * @static
     * @private
     *
     * @this   {Tmpl}
     * @param  {string}
     * @param  {object}
     * @return {undefined}
     */
    Tmpl._exe = function(tmpl, data) {
        try {
            tmpl = eval(tmpl);
        } catch (exception) {
            return '';
        }

        return tmpl;
    };

    /**
     * Parse {% tag %}
     *
     * @static
     * @private
     *
     * @this   {Tmpl}
     * @param  {string}
     * @param  {object}
     * @return {string}
     */
    Tmpl._parse4tags = function(tmpl, data) {
        var
            end    = 0,
            pos    = 0,
            tag    = '',
            params = '',
            tags   = tmpl.match(/\{%[\s]*([_\w\d]*)(([\s]*[^\s%]*)*)[\s]*%\}/g);

        if (tags) {
            end = tags.length;

            for (pos = 0; pos < end; pos++) {
                tag    = tags[pos].replace(/\{% ?| ?%\}/g, '').split(' ');
                params = tag.slice(1).join(',');
                tag    = tag.shift();

                // Replace {% tag %}
                if (Tmpl._tags[tag]) {
                    tmpl = tmpl.replace(tags[pos], "' + Tmpl._tags['" + tag + "'](" + params + ")+'");
                } else {
                    tmpl = tmpl.replace(tags[pos], '');
                }
            }
        }

        return tmpl;
    };

    /**
     * Parse {{ variable }}
     *
     * @static
     * @private
     *
     * @this   {Tmpl}
     * @param  {string}
     * @param  {object}
     * @return {string}
     */
    Tmpl._parse4vars = function(tmpl, data) {
        var
            fend    = 0,
            fpos    = 0,
            vend    = 0,
            vpos    = 0,
            outb    = "';try{out+=",
            oute    = "}catch(e){};out+='",
            alias   = '',
            filter  = '',
            vars    = tmpl.match(/\{\{[\s]*[^\s}]*[\s]*\}\}/g),
            filters = [];

        if (vars) {
            vend = vars.length;

            for (vpos = 0; vpos < vend; vpos++) {
                alias   = vars[vpos]
                          .replace(/(^\{\{[\s*])|([\s]*\}\}$)/g, '')
                          .split('|');
                filters = alias.slice(1).reverse();
                alias   = alias[0];
                fend    = filters.length;

                if (fend) {
                    for (fpos = 0; fpos < fend; fpos++) {
                        filter = filters[fpos];

                        if (Tmpl._filters[filter]) {
                            outb += "Tmpl._filters['" + filter + "'](";
                            oute = ")" + oute;
                        }
                    }
                }

                // Replace for {{ variable }}
                tmpl = tmpl.replace(
                    vars[vpos],
                    outb + Tmpl._parse4secondary(alias) + oute
                );
            }
        }

        return tmpl;
    };

    /**
     * Parse {% block %} and {% endblock %}
     *
     * @todo
     * @static
     * @private
     *
     * @this   {Tmpl}
     * @param  {string}
     * @param  {object}
     * @return {string}
     */
    Tmpl._parse4blocks = function(tmpl, data) {
        return tmpl;
    };

    /**
     * Parse {% filter %} and {% endfilter %}
     *
     * @static
     * @private
     *
     * @this   {Tmpl}
     * @param  {string}
     * @return {string}
     */
    Tmpl._parse4filters = function(tmpl, data) {
        var
            end     = 0,
            pos     = 0,
            filter  = '',
            filters = tmpl.match(/\{%[\s]*filter[\s]+[\d\w_\-]+[\s]*%\}/ig);

        if (filters) {
            end = filters.length;

            for (pos = 0; pos < end; pos++) {
                filter = filters[pos]
                         .replace(/[^\d\w_\-]|filter/ig, '');

                // Replace {% filter %}
                if (Tmpl._filters[filter]) {
                    tmpl = tmpl.replace(
                        filters[pos],
                        "';out+=Tmpl._filters['" + filter + "']('"
                    );
                } else {
                    tmpl = tmpl.replace(filters[pos], '');
                }
            }

            // Replace {% endfilter %}
            tmpl = tmpl.replace(
                /\{%[\s]*endfilter[\s]*%\}/ig,
                "');out+='"
            );
        }

        return tmpl;
    };

    /**
     * Parse {#, #}, {% comment %} and {% endcomment %}
     *
     * @static
     * @private
     *
     * @this   {Tmpl}
     * @param  {string}
     * @param  {object}
     * @return {string}
     */
    Tmpl._parse4comments = function(tmpl, data) {
        tmpl = tmpl
               .replace(/(\{#)|(\{%[\s]*comment[\s]*%\})/g, "';/*")
               .replace(/(#\})|(\{%[\s]*endcomment[\s]*%\})/, "*/out+='");

        return tmpl;
    }

    /**
     * Parse {% include %}
     *
     * @static
     * @private
     *
     * @this   {Tmpl}
     * @param  {string}
     * @param  {object}
     * @return {string}
     */
    Tmpl._parse4includes = function(tmpl, data) {
        var
            end      = 0,
            pos      = 0,
            alias    = '',
            found    = '',
            included = '',
            includes = tmpl.match(/\{%[\s]*include[\s]+([\d\w_.\-"'\/]*)[\s]*?%\}/g);

        if (includes) {
            end = includes.length;

            for (pos = 0; pos < end; pos++) {
                found = includes[pos];
                alias = found
                        .replace(/(^\{%[\s]*include[\s]+)|([\s]*%\}$)/g, '')
                        .replace(/["']/g, '');

                // Replace {% include %}
                if (Tmpl._tmpls[alias]) {
                    tmpl = tmpl.replace(
                        found,
                        Tmpl._compile(Tmpl._tmpls[alias], data, true)
                    );
                }
            }
        }

        return tmpl;
    };

    /**
     * Parse {% with %} and {% endwith %}
     *
     * @static
     * @private
     *
     * @this   {Tmpl}
     * @param  {string}
     * @param  {object}
     * @return {string}
     */
    Tmpl._parse4with = function(tmpl, data) {
        var
            end    = 0,
            pos    = 0,
            copy   = '',
            origin = '',
            vars   = tmpl.match(/\{%[\s]*with[\s]+[\S]*[\s]+as[\s]+[^\s%]*[\s]*%\}/ig);

        if (vars) {
            end = vars.length;

            for (pos = 0; pos < end; pos++) {
                origin = vars[pos]
                         .replace(/(^\{%[\s]*with[\s]+)|([\s]*%\}$)/ig, '')
                         .split(/[\s]+as[\s]+/i);
                copy   = origin[1];
                origin = origin[0];

                // Replace {% with %}
                tmpl = tmpl.replace(
                    vars[pos],
                    "';(function(){var " + copy + "=" + Tmpl._parse4secondary(origin) + ";out+='"
                );
            }

            // Replace {% endwith %}
            tmpl = tmpl.replace(
                /\{%[\s]*endwith[\s]*%\}/ig,
                "';})();out+='"
            );
        }

        return tmpl;
    };

    /**
     * Parse {% if %}, {% elsif %}, {% else %} and {% endif %}
     *
     * @static
     * @private
     *
     * @this   {Tmpl}
     * @param  {string}
     * @param  {object}
     * @return {string}
     */
    Tmpl._parse4modals = function(tmpl, data) {
        var
            end   = 0,
            pos   = 0,
            cond  = '',
            type  = '',
            value = '',
            ifs   = tmpl.match(/\{%[\s]*(if|elif)[\s]+([^%]*)[\s]*%\}/ig)
            tmp   = [];

        if (ifs) {
            end  = ifs.length;

            for (pos = 0; pos < end; pos++) {
                cond  = ifs[pos];
                tmp   = cond
                        .replace(/^\{%[\s]*|[\s]*%\}$/g, '')
                        .split(/\s/);
                type  = tmp[0];
                value = tmp[1];

                if (type == 'elif') {
                    // Replace {% elsif %}
                    tmpl = tmpl.replace(
                           cond,
                           "';}else if(" + Tmpl._parse4secondary(value) + "){out+='"
                    );
                } else {
                    // Replace {% if %}
                    tmpl = tmpl.replace(
                        cond,
                        "';if(" + Tmpl._parse4secondary(value) + "){out+='"
                    );
                }
            }

            // Replace {% else %} and {% endif %}
            tmpl = tmpl
                   .replace(/\{%[\s]*else[\s]*%\}/ig,  "';}else{out+='")
                   .replace(/\{%[\s]*endif[\s]*%\}/ig, "';}out+='");
        }

        return tmpl;
    };

    /**
     * Parse {% for %} and {% endfor %}
     *
     * @static
     * @private
     *
     * @this   {Tmpl}
     * @param  {string}
     * @param  {object}
     * @return {boolean|string}
     */
    Tmpl._parse4cicles = function(tmpl, data) {
        var
            end   = 0,
            pos   = 0,
            cond  = '',
            hash  = '',
            value = '',
            tmp   = [],
            fors  = tmpl.match(/\{%[\s]*for[\s]*([^%]*)[\s]*in[\s]([^%]*)[\s]*?%\}/ig);

        if (fors) {
            end = fors.length;

            for (pos = 0; pos < end; pos++) {
                cond  = fors[pos];
                tmp   = cond
                        .replace(/^\{%[\s]*|[\s]*%\}$/g, '')
                        .split(/\s/);
                hash  = tmp[3];
                value = tmp[1];

                // Replace {% for %}
                tmpl = tmpl.replace(
                    fors[pos],
                    "';(function(){" +
                        "var " +
                            "alias=''," +
                            value + "=null;" +
                        "for(alias in " + hash + "){" +
                            "if(" + hash + ".hasOwnProperty(alias)){" +
                                value + "=" + hash + "[alias];" +
                                "out+='"

                );
            }

            // Replace {% endfor %}
            tmpl = tmpl.replace(
                /\{%[\s]*endfor[\s]*%\}/ig,
                            "';" +
                        "}" +
                    "}" +
                "})();out+='"
            );
        }

        return tmpl;
    };

    /**
     * Parse some secondary constructions
     *
     * @static
     * @private
     *
     * @this   {Tmpl}
     * @param  {string}
     * @return {string}
     */
    Tmpl._parse4secondary = function(str) {
        return str
               .replace(/\.(\d*)/, '[$1]')
               .replace(/ and /ig, '&&')
               .replace(/ eq /ig, '==')
               .replace(/ ne /ig, '!=')
               .replace(/ or /ig,  '||');
    }

    return Tmpl;
})();