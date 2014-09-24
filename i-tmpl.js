/**
 * Django or Jinja like template engine for JavaScript
 *
 * @page    http://github.com/Shushik/i-tmpl/
 * @author  Shushik <silkleopard@yandex.ru>
 * @version 2.0
 */
function
    /**
     * @constructor
     *
     * @param {string} code
     * @param {object} vars
     *
     * @return {object}
     */
    JST(code, vars) {
        if (this instanceof JST) {
            this.init(code, vars);
        } else {
            return new JST(code, vars).html;
        }
    }; JST.$ = JST.prototype;

    /**
     * Dev mode indicator
     *
     * @type {string}
     */
    JST.$.dev = false;

    /**
     * Raw template code
     *
     * @type {string}
     */
    JST.$.raw = '';

    /**
     * HTML code ready for use
     *
     * @type {string}
     */
    JST.$.html = '';

    /**
     * All available templates
     *
     * @type {object}
     */
    JST.$.list = {};

    /**
     * 
     */
    JST.$.loop = {};

    /**
     * All variables for the running template
     *
     * @type {object}
     */
    JST.$.vars = {};

    /**
     * Init the module
     *
     * @param {string} code
     * @param {object} vars
     */
    JST.$.init = function(code, vars) {
        var
            name = code.substring(0, 50);

        // Save a link to the current JST example
        JST._ = this;

        // Cache the code
        this.raw  = this.check(name);
        this.html = '';

        // Cache vars
        this.vars = typeof vars == 'object' ? vars : {};

        // Compile and execute template
        this.compile();
        this.execute();
    }

    /**
     * Add a template into the templates list
     *
     * @param {string} name
     * @param {string} code
     */
    JST.$.add = JST.add = function(name, code) {
        JST.$.list[name] = code;
    }

    /**
     * Select the code source
     *
     * @param {string} name
     *
     * @return {string}
     */
    JST.$.check = function(name) {
        var
            code = '';

        if (this.list[name]) {
            code = this.list[name];
        } else if (this.vars[name]) {
            code = this.vars[name];
        } else {
            code = name;
        }

        return code;
    }

    /**
     * Parse and compile the code
     *
     * @param {undefined|string}
     *
     * @return {string}
     */
    JST.$.compile = function(name) {
        var
            al0  = '',
            type = typeof name,
            code = (type == 'string' ? this.check(name) : this.raw),
            vars = '';

        // Parse the includes
        code = this._includes(code);
        code = this._sets(code);

        // Commit changes
        if (type == 'undefined') {
            // Replace unsafe symbols
            code = code.replace(/(([^{])%([^}]))/g, '$2\\%$3');

            // Create variables code
            for (al0 in this.vars) {
                vars += (!vars ? '' : ',') +
                        al0 + '=JST._.vars[\'' + al0 + '\']';
            }

            // Parse the all constructions
            code = this._ifs(code);
            code = this._vars(code);
            code = this._fors(code);
            code = this._comments(code);

            // Create a wrapper code
            code = ';(function(){var ' + vars + ';' + code;
            code = code + '\'})();';

            // Save the parsed code
            this.raw = code;
        } else {
            // Create a wrapper code
            code = '\'+(function(){' + code + '\';})()+\'';
        }

        return code;
    }

    /**
     * Execute the parsed and compiled code
     */
    JST.$.execute = function() {
        try {
            // Execute the generated JS-code
            this.html = eval(this.raw);
        } catch (exc) {
            // Show error messages in development mode
            if (this.dev) {
                throw exc;
            }
        }
    }

    /**
     * {% if %}, {% elif %}, {% else %} replacement
     *
     * @private
     *
     * @param {string} code
     *
     * @return {string}
     */
    JST.$._ifs = function(code) {
        var
            al0 = '',
            al1 = '',
            al2 = '',
            al3 = '',
            exp = '',
            ifs = code.match(/\{%\s*(el)?if\s+(\\%|[^%])*%\}/g);

        if (ifs) {
            for (al0 in ifs) {
                exp = ifs[al0];
                al1 = exp.replace(/(^\{%\s*|\s*%\}$)/g, '');
                al1 = al1.split(/\s+/);
                al2 = al1.shift();
                al1 = al1.join(' ');

                if (al2 == 'if') {
                    code = code.replace(
                        exp,
                        '\'+(function(){if(' + al1 + '){return \''
                    );
                } else if (al2 == 'elif') {
                    code = code.replace(
                        exp,
                        '\';}else if(' + al1 + '){return \''
                    );
                }
            }

            code = code.replace(
                /\{%\s*else\s*%\}/g,
                '\';}else{return \''
            );

            code = code.replace(
                /\{%\s*endif\s*%\}/g,
                '\';}})()+\''
            );
        }

        return code;
    }

    /**
     * {% for %} replacement
     *
     * @private
     *
     * @param {string} code
     *
     * @return {string}
     */
    JST.$._fors = function(code) {
        var
            al0  = '',
            al1  = '',
            al2  = '',
            al3  = '',
            exp  = '',
            fors = code.match(/\{%\s*for\s+[\d\w]*(,\s*[\d\w]*)?\s+in\s+[\d\w.]*\s*%\}/g);

        if (fors) {
            for (al0 in fors) {
                exp = fors[al0];
                al1 = exp.replace(/(^\{%\s*for\s*|\s*%\}$)/g, '');
                al1 = al1.split(/\s+/g);
                al2 = al1.shift();

                if (al2.match(/,$/g)) {
                    al2 = al2.replace(/,$/, '');
                    al3 = al1.shift();
                } else if (al2.match(/,/g)) {
                    al2 = al2.split(/,/g);
                    al3 = al2.shift();
                    al2 = al2[0];
                }

                al1.shift();
                al1 = al1.join(' ');

                JST._.vars[al2] = null;

                code = code.replace(
                    exp,
                    '\'+(function(){' +
                        'var ' +
                            'loop={' +
                                'index:0,' +
                                'index0:0,' +
                                'key:\'\',' +
                                'code:\'\'' +
                            '};' +
                        'if(' + al1 + ' instanceof Array){' +
                            'loop.last=false;' +
                            'loop.first=true;' +
                            'loop.lengh=' + al1 + '.length;' +
                        '}' +
                        'for(loop.key in ' + al1 + '){' +
                            (al3 ? 'var ' + al3 + '=loop.key;' : '') +
                            'var ' + al2 + '=' + al1 + '[loop.key];' +
                            'loop.index0=loop.index;' +
                            'loop.index++;' +
                            'if(loop.length){' +
                                'loop.last=loop.index==loop.length?' +
                                           'true:' +
                                           'false;' +
                                'loop.first=loop.index==1?' +
                                            'true:' +
                                            'false;' +
                            '}' +
                            'loop.code+=\''
                );
            }

            code = code.replace(
                /\{%\s*endfor\s*%\}/g,
                '\';}return loop.code;})()+\''
            );
        }

        return code;
    }

    /**
     * {{ variable }} replacement
     *
     * @private
     *
     * @param {string} code
     *
     * @return {string}
     */
    JST.$._vars = function(code) {
        var
            al0  = '',
            al1  = '',
            exp  = '',
            vars = code.match(/\{\{\s*([\w\d_.\[\]]*)\s*\}\}/g);

        if (vars) {
            for (al0 in vars) {
                exp = vars[al0];
                al1 = exp.replace(/(\{\{\s*|\s*?\}\})/g, '');

                code = code.replace(
                    exp,
                    '\'+' + al1 + '+\''
                );
            }
        }

        return code;
    }


    /**
     * {% with %} replacement
     *
     * @private
     *
     * @param {string} code
     *
     * @return {string}
     */
    JST.$._sets = function(code) {
        var
            al0  = '',
            al1  = '',
            al2  = '',
            exp  = '',
            sets = code.match(/\{%\s*set\s+[\w\d]+\s*=\s*(\\%|[^%])+%\}/g);

        code = 'return \'' + code;

        if (sets) {
            for (al0 in sets) {
                exp = sets[al0];
                al1 = exp.replace(/(^\{%\s*set\s+|\s*%\})/g, '');
                al1 = al1.split(/=/g);
                al2 = al1.shift();
                al1 = al1.join('=');

                code = 'var ' + al2 + ';' + code;
                code = code.replace(
                    exp,
                    '\'+(' + al2 + '=' + al1 + ',\'\')+\''
                );
            }
        }

        return code;
    }

    /**
     * {% include %} replacement
     *
     * @private
     *
     * @param {string} code
     *
     * @return {string}
     */
    JST.$._includes = function(code) {
        var
            al0  = '',
            exp  = '',
            incs = code.match(/\{%\s*include\s+([\w\d._\/]+)\s*?%\}/g);

        if (incs) {
            for (al0 in incs) {
                exp  = incs[al0];
                code = code.replace(
                    exp,
                    this.compile(
                        exp.
                        replace(/^\{%\s*include /, '').
                        replace(/\s*%\}$/, '')
                    )
                );
            }
        }

        return code;
    }

    /**
     * {# comment #} replacement
     *
     * @private
     *
     * @param {string}
     *
     * @return {string}
     */
    JST.$._comments = function(code) {
        return code
               .replace(/(\{#)|(\{%[\s]*comment[\s]*%\})/g, "\'+/*")
               .replace(/(#\})|(\{%[\s]*endcomment[\s]*%\})/, "*/\'\'+\'");
    }