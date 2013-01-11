    i-tmpl (JTE) — Django or Jinja like template engine for JavaScript

    Goods:
    — simple usage;
    — compatibility with all existant frameworks;
    — static syntax (no need to make an example to use Tmpl object methods.



    Requirements:

    — JavaScript (frontend or backend).



    Code example:

    <code>
        <!-- Single simple template without tags or filters -->

        <div id="target"></div>
        <script type="text/javascript" src="i-tmpl.min.js"></script>
        <script type="text/javascript">
            JTE.set(
                'template',
                'main_template',
                '<div class="b-template b-template_type_main">' +
                    '{{ myvar }}' +
                '</div>'
            );

            var
                target = document.getElementById('target'),
                html   = JTE.render(
                    'main_template',
                    {
                        myvar : 'my variable value'
                    }
                );

            target.innerHTML = html;
        </script>
    </code>



    .set() method

     param | description
    =============================================================
     type  | String with the type of the saving entity
           |
           | Should have the following value:
           | — tag;
           | — filter;
           | — template.
    -------------------------------------------------------------
     alias | The name of the tag, filter or the template to
           | call it
    -------------------------------------------------------------
     value | String with the template html if the type variable
           | has the «template» value, or function if it`s
           | «filter» or «tag»
    =============================================================


    1. How to set a template:

    <code>
        <div id="target"></div>
        <script type="text/javascript" src="i-tmpl.min.js"></script>
        <script type="text/javascript">
            var
                target = document.getElementById('target');

            JTE.set(
                'template',
                'main_template',
                '<div>' +
                    '<p>The content of the main template</p>' +
                    '{% include "secondary_template" %}' +
                '</div>'
            );

            JTE.set(
                'template',
                'main_template',
                '<p>' +
                    'The content of the secondary template' +
                    'with some {{ variable }} in it' +
                '</p>'
            );

            target.innerHTML = JTE.render(
                'main_template',
                {
                    variable : 'variable'
                }
            );
        </script>
    </code>

    Note that template alias could be any string, so you can get
    by a backend media generator any file content by a real path
    and just save it using the .set() method like this:

    <code>
        <div id="target"></div>
        <script type="text/javascript" src="i-tmpl.min.js"></script>
        <script type="text/javascript">
            var
                path   = 'path/to/your/file.html',
                target = document.getElementById('target');

            JTE.set(
                path,
                'Content from the file «{{ path }}»'
            );

            target.innerHTML = JTE.render(
                path,
                {
                    path : path
                }
            );
        </script>
    </code>


    2. How to set a filter

    <code>
        <div id="target"></div>
        <script type="text/javascript" src="i-tmpl.min.js"></script>
        <script type="text/javascript">
            var
                target = document.getElementById('target');

            JTE.set(
                'filter',
                'lowercase',
                function(str) {
                    return str.toLowerCase();
                }
            );

            JTE.set(
                'template',
                'my_little_template',
                '<div>' +
                    '{% filter lowercase %}TEXT IN UPPERCASE{% endfilter %}' +
                '</div>'
            );

            target.innerHTML = JTE.render('my_little_template');
        </script>
    </code>


    3. How to set a tag

    <code>
        <div id="target"></div>
        <script type="text/javascript" src="i-tmpl.min.js"></script>
        <script type="text/javascript">
            var
                target = document.getElementById('target');

            JTE.set(
                'tag',
                'plural',
                function(num, one, two, ten) {
                    ten = ten || two;
                    if (num % 100 > 10 && num % 100 < 20) {
                        return ten;
                    }
                    switch (num % 10) {
                        case 1:
                            return one;
                        break;
                        case 2: case 3: case 4:
                            return two;
                        break;
                    }
                    return ten;
                }
            );

            JTE.set(
                'template',
                'shaggy_sheeps_counting',
                '<div>' +
                    'Yay! I`ve got {{ sheeps }} shaggy ' +
                    '{% plural sheeps "sheep" "sheeps" "sheeps" %} ' +
                    'in my yard!' +
                '</div>'
            );

            target.innerHTML = JTE.render(
                'shaggy_sheeps_counting',
                {
                    sheeps : 12
                }
            );
        </script>
    </code>



    .render() method

     param | description
    =============================================================
     alias | The template alias used in .set() method
    -------------------------------------------------------------
     data  | Data object with the variables for the template
           | (optional)
    =============================================================



    Templates syntax


    1. Variable

    <code>
        {{ variable }}
    </code>


    2. Comments

    <code>
        {#
            Some commented code
        #}
    </code>

    <code>
        {% comment %}
            Some commented code
        {% endcomment %}
    </code>


    3. Cycle

    <code>
        <ul>
            {% for item in items %}
                <li>{{ item.text }}</li>
            {% endfor %}
        </ul>
    </code>

    You can use the forloop (Django style) and loop (Jinja style) variables
    inside of cycle. These objects have the following properties:

    — loop.first  — true if the current iteration is first;
    — loop.last   — true if the current iteration is last (arrays only);
    — loop.length — a number of items in a stack (arrays only);
    — loop.index  — a number of the current iteration starting with 1;
    — loop.index0 — a number of the current iteration starting with 0.

    — forloop.first    — true if the current iteration is first;
    — forloop.last     — true if the current iteration is last (arrays only);
    — forloop.length   — a number of items in a stack (for arrays only);
    — forloop.counter  — a number of the current iteration starting with 1;
    — forloop.counter0 — a number of the current iteration starting with 0.


    4. Modal

    <code>
        <div>
            {% if ifvalue %}
                {{ ifvalue }}
            {% elif elifvalue %}
                {{ elifvalue }}
            {% else %}
                {{ elsevalue }}
            {% endif %}
        </div>
    </code>


    5. Include

    <code>
        {% include "template_alias" %}
    </code>


    6. Setting a variable

    <code>
        {% with array.0 as variable %}
            {{ variable }}
        {% endwith %}
    </code>

    <code>
        {% set var_1 = "var1" %}
        {% set var_2 = ["v", "a", "r", "_", "2"] %}
    </code>


    7. Filter usage

    <code>
        {% filter lowercase %}TEXT IN UPPERCASE{% endfilter %}
    </code>

    <code>
        {{ variable|lowercase|uppercase }}
    </code>


    8. Tag usage

    <code>
        {% tag_name param_1 param_2 param_n %}
    </code>

    9. Block usage

    <code>
        {# Define block «rainbow_dash» #}
        {% block rainbow_dash %}
            Some block content
        {% endblock %}

        {# Use block «rainbow_dash» #}
        {% block rainbow_dash %}{% endblock %}
    </code>