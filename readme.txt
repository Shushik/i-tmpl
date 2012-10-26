    i-tmpl (JTE) — Django or Jinja like template engine for JavaScript

    Goods:
    — simple usage;
    — compatibility with all existant frameworks;
    — static syntax (no need to make an example to use Tmpl object methods.


    Requirements:

    — JavaScript.


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


    .render() method

     param          | description
    =============================================================
     template_alias | 
    -------------------------------------------------------------
     variables_data | 
    =============================================================


    .set() method

     param        | description
    =============================================================
     entity_type  | 
    -------------------------------------------------------------
     entity_alias | 
    -------------------------------------------------------------
     entity_value | 
    =============================================================