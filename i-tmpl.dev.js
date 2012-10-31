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
     * @private
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
     * @return {boolean|string|function}
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
                        .replace(/([\n\r\t])/g, ' ')
                        .replace(/\s{2,}/, ' ')
                        .replace(/(')/g, '\\$1');
            }

            Tmpl[aliases[type]][alias] = value;

            return Tmpl[aliases[type]][alias];
        }

        return false;
    };

    /**
     * Load a template file using syncronous ajax request
     *
     * @static
     *
     * @this   {Tmpl}
     * @param  {string}
     * @return {undefined}
     */
    Tmpl.load = function(path) {
        var
            pos  = 0,
            html = '';

        Tmpl._tmpls[path] = html;
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
        } else if (path.match(/\s/)) {
            tmpl = path;
        } else {
            tmpl = '';
        }

        // Try to compile template
        tmpl = Tmpl._compile(path, tmpl, data);

        // Try to execute template
        tmpl = Tmpl._exe(path, tmpl, data);

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
     * @param  {string}
     * @param  {object}
     * @param  {boolean}
     * @return {undefined}
     */
    Tmpl._compile = function(path, tmpl, data, include) {
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
                'extends',
                'includes',
                'modals',
                'loops',
                'vars',
                'filters',
                'comments',
                'sets',
                'with',
                'tags'
            ];

        // Total number of parsers
        end = parsers.length;

        // Clean blocks object
        Tmpl._blocks = {};

        // Iterate the template through the parsers
        for (pos = 0; pos < end; pos++) {
            parser = Tmpl['_parse4' + parsers[pos]];

            if (parser) {
                tmpl = parser(path, tmpl, data);
            }
        }

        // Compile a template variables
        if (!include) {
            for (alias in data) {
                vars += alias + "=___data['" + alias + "'],";
            }
        }

        // Give the final compiled code
        return (include ? "'" : "") +
               ";(function(___path,___data){" +
               (include ? "" : "var " + vars + "___out='',___blocks={};") +
               "try {" +
                   "___out+='" + tmpl + "';" +
               "}catch(exception){" +
                   "___out='';" +
               "}" +
               "return ___out;" +
               "})('" + path + "',data);" +
               (include ? "___out+='" : "");
    };

    /**
     * Execute the compiled javascript code
     *
     * @static
     * @private
     *
     * @this   {Tmpl}
     * @param  {string}
     * @param  {string}
     * @param  {object}
     * @return {undefined}
     */
    Tmpl._exe = function(path, tmpl, data) {
        try {
            tmpl = eval(tmpl);
        } catch (exception) {
            if (Tmpl.dev) {
                throw exception;
            } else {
                return '';
            }
        }

        return tmpl;
    };

    /**
     * Parse {% set %}
     *
     * @static
     * @private
     *
     * @this   {Tmpl}
     * @param  {string}
     * @param  {string}
     * @param  {object}
     * @return {string}
     */
    Tmpl._parse4sets = function(path, tmpl, data) {
        var
            end  = 0,
            pos  = 0,
            set  = '',
            sets = tmpl.match(/\{%[\s]*set[\s]+([^%]*)%\}/ig);

        //
        if (sets) {
            end = sets.length;

            for (pos = 0; pos < end; pos++) {
                set = sets[pos]
                      .replace(/(^\{%[\s]*set[\s]+)|([\s]*%\})/ig, '');

                // Replace {% set %}
                tmpl = tmpl.replace(
                    sets[pos],
                    "';var " + set + ";___out+='"
                );
            }
        }

        return tmpl;
    }

    /**
     * Parse {% tag %}
     *
     * @static
     * @private
     *
     * @this   {Tmpl}
     * @param  {string}
     * @param  {string}
     * @param  {object}
     * @return {string}
     */
    Tmpl._parse4tags = function(path, tmpl, data) {
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
                    tmpl = tmpl.replace(
                        tags[pos],
                        "' + Tmpl._tags['" + tag + "'](" + params + ")+'"
                    );
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
     * @param  {string}
     * @param  {object}
     * @return {string}
     */
    Tmpl._parse4vars = function(path, tmpl, data) {
        var
            fend    = 0,
            fpos    = 0,
            vend    = 0,
            vpos    = 0,
            outb    = "';try{___out+=",
            oute    = "}catch(e){};___out+='",
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
     * Parse {% with %} and {% endwith %}
     *
     * @static
     * @private
     *
     * @this   {Tmpl}
     * @param  {string}
     * @param  {string}
     * @param  {object}
     * @return {string}
     */
    Tmpl._parse4with = function(path, tmpl, data) {
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
                    "';(function(){var " + copy + "=" + Tmpl._parse4secondary(origin) + ";___out+='"
                );
            }

            // Replace {% endwith %}
            tmpl = tmpl.replace(
                /\{%[\s]*endwith[\s]*%\}/ig,
                "';})();___out+='"
            );
        }

        return tmpl;
    };

    /**
     * 
     *
     * @static
     * @private
     *
     * @this   {Tmpl}
     * @param  {string}
     * @param  {string}
     * @param  {object}
     * @return {string}
     */
    Tmpl._parse4blocks4includes = function(path, tmpl, data) {
        var
            trigger = false,
            end     = 0,
            pos     = 0,
            block   = '',
            total   = '',
            blocks  = tmpl.match(/\{%[\s]*block[\s]+[\w\d_\-]+[\s]*%\}(\{%[\s]*endblock[\s]*%\})?/ig);

        if (blocks) {
            end = blocks.length;

            for (pos = 0; pos < end; pos++) {
                block   = blocks[pos];
                trigger = block.match('endblock') ? true : false;
                block   = block
                          .replace(/(^\{%[\s]*block[\s]+)|([\s]*%\}[\s\S]*)/ig, '');

                if (!trigger) {
                    tmpl = tmpl.replace(
                        blocks[pos],
                        "';___blocks['" + block + "']=function(){var ___out='"
                    );
                } else {
                    tmpl = tmpl.replace(
                        blocks[pos],
                        "';if(___blocks['" + block + "']){___out+=___blocks['" + block + "']();};___out+='"
                    );
                }
            }

            tmpl = tmpl.replace(
                /\{%[\s]*endblock[\s]*%\}/ig,
                "';return ___out;};___out+='"
            );
        }

        return tmpl;
    };

    /**
     * 
     *
     * @static
     * @private
     *
     * @this   {Tmpl}
     * @param  {string}
     * @param  {string}
     * @param  {object}
     * @return {string}
     */
    Tmpl._parse4blocks4extends = function(path, tmpl, data) {
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
     * @param  {string}
     * @param  {object}
     * @return {string}
     */
    Tmpl._parse4loops = function(path, tmpl, data) {
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
                            "___alias=''," +
                            value + "=null;" +
                        "for(___alias in " + hash + "){" +
                            "if(" + hash + ".hasOwnProperty(___alias)){" +
                                value + "=" + hash + "[___alias];" +
                                "___out+='"

                );
            }

            // Replace {% endfor %}
            tmpl = tmpl.replace(
                /\{%[\s]*endfor[\s]*%\}/ig,
                            "';" +
                        "}" +
                    "}" +
                "})();___out+='"
            );
        }

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
     * @param  {string}
     * @param  {object}
     * @return {string}
     */
    Tmpl._parse4filters = function(path, tmpl, data) {
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
                        "';___out+=Tmpl._filters['" + filter + "']('"
                    );
                } else {
                    tmpl = tmpl.replace(filters[pos], '');
                }
            }

            // Replace {% endfilter %}
            tmpl = tmpl.replace(
                /\{%[\s]*endfilter[\s]*%\}/ig,
                "');___out+='"
            );
        }

        return tmpl;
    };

    /**
     * Parse {% extends %}
     *
     * @static
     * @private
     *
     * @this   {Tmpl}
     * @param  {string}
     * @param  {string}
     * @param  {object}
     * @return {string}
     */
    Tmpl._parse4extends = function(path, tmpl, data) {
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
     * @param  {string}
     * @param  {object}
     * @return {string}
     */
    Tmpl._parse4comments = function(path, tmpl, data) {
        tmpl = tmpl
               .replace(/(\{#)|(\{%[\s]*comment[\s]*%\})/g, "';/*")
               .replace(/(#\})|(\{%[\s]*endcomment[\s]*%\})/, "*/___out+='");

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
     * @param  {string}
     * @param  {object}
     * @return {string}
     */
    Tmpl._parse4includes = function(path, tmpl, data) {
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
                        Tmpl._compile(
                            alias,
                            Tmpl._parse4blocks4includes(alias, Tmpl._tmpls[alias], data),
                            data,
                            true
                        )
                    );
                }
            }
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
     * @param  {string}
     * @param  {object}
     * @return {string}
     */
    Tmpl._parse4modals = function(path, tmpl, data) {
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
                type  = tmp.shift();
                value = Tmpl._parse4secondary(tmp.join(' '));

                if (type == 'elif') {
                    // Replace {% elsif %}
                    tmpl = tmpl.replace(
                           cond,
                           "';}else if(" + Tmpl._parse4secondary(value) + "){___out+='"
                    );
                } else {
                    // Replace {% if %}
                    tmpl = tmpl.replace(
                        cond,
                        "';if(" + Tmpl._parse4secondary(value) + "){___out+='"
                    );
                }
            }

            // Replace {% else %} and {% endif %}
            tmpl = tmpl
                   .replace(/\{%[\s]*else[\s]*%\}/ig,  "';}else{___out+='")
                   .replace(/\{%[\s]*endif[\s]*%\}/ig, "';}___out+='");
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
               .replace(/\.(\d+)/, '[$1]')
               .replace(/[\s]*and[\s]+/ig, '&&')
               .replace(/[\s]*not[\s]+/ig, '!')
               .replace(/[\s]*eq[\s]+/ig, '==')
               .replace(/[\s]*ne[\s]+/ig, '!=')
               .replace(/[\s]*or[\s]+/ig,  '||');
    }

    return Tmpl;
})();