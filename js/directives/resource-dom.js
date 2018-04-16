define(['directives/directives', 'bootstrap-dialog', 'datatables.net', 'datatables.net-bs', 'datatables.net-select'],
  function(directives, BootstrapDialog, datatables) {
    'use strict';
    //设备模板列表
    directives.initDirective('resourceListTable', ['$timeout', '$compile', 'growl', function($timeout, $compile, growl) {
      return {
        restrict: 'A',
        controller: ['$scope', '$element', '$attrs',
          function($scope, $element, $attrs) {
            var domMain = $element;
            var table;

            var isEditing = false;
            $scope.$on("RESOURCE", function(event, args) {
              if(table) {
                table.destroy();
                domMain.empty();
              }
              isEditing = false;
              table = domMain.DataTable({
                dom: args.data && args.data.length > 0 ? $.ProudSmart.datatable.footerdom : '',
                language: $.ProudSmart.datatable.language,
                select: $.ProudSmart.datatable.select,
                data: args.data,
                order: [
                  [5, "desc"]
                ],
                columns: [{
                  data: "label",
                  title: "模板名称"
                }, {
                  data: "desc",
                  title: "模板描述"
                }, {
                  data: "values.series",
                  title: "产品系列"
                }, {
                  data: "values.modelNo",
                  title: "设备型号"
                }, $.ProudSmart.datatable.optionCol3, {
                  data: "createTime",
                  title: "",
                  visible: false
                }],
                "columnDefs": [{
                  "targets": 1,
                  "data": "desc",
                  "render": function(data, type, full) {
                    return data;
                  }
                }, {
                  "targets": 2,
                  "data": "values.series",
                  "render": function(data, type, full) {
                    var str = full.values.series ? full.values.series : "";
                    return str;
                  }
                }, {
                  "targets": 3,
                  "data": "values.modelNo",
                  "render": function(data, type, full) {
                    var str = full.values.modelNo ? full.values.modelNo : "";
                    return str;
                  }
                }, {
                  "targets": 4,
                  "data": "option",
                  "render": function(data, type, full) {
                    // 返回自定义内容
                    var str = "<div class='btn-group btn-group-sm'>";
                    if($scope.menuitems['A04_S01']) {
                      str += "<button id='edit-btn'  ng-click='addMod(" + full.id + ");'  class='btn btn-primary' ><i class='fa fa-edit hidden-lg hidden-md hidden-sm'></i><span class='hidden-xs'> 管理</span></button>";
                    }
                    if($scope.menuitems['A05_S01']) {
                      str += "<button id='del-btn'   class='btn btn-default' ><i class='fa fa-trash hidden-lg hidden-md hidden-sm'></i><span class='hidden-xs'> 删除</span></button>";
                    }
                    if($scope.menuitems['A06_S01']) {
                      str += "<button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown'> 更多<span class='caret'></span></button>";
                      str += "<ul class='dropdown-menu' role='menu'>";
                      if($scope.menuitems['A06_S01']) {
                        str += "<li><a role='button' ng-click='modelViewEdit(" + full.id + ");' id='disable-btn'>设计仪表板</a></li>";
                      }
                      if($scope.menuitems['A12_S01']) {
                        str += "<li><a id='xml-btn' role='button' >导出SDK模板</a></li>";
                      }
                      str += "</ul>";
                    }
                    str += "</div>";
                    return str;
                  }
                }],
                rowCallback: function(nRow, aData, iDataIndex) {
                  $compile(nRow)($scope);
                }
              });
            });
            domMain.on('click', '#xml-btn', function(e) {
              e.preventDefault();
              var tr = $(this).closest('tr');
              tr.addClass('selected');
              var row = table.row(tr);
              $scope.writeXml(row.data());
            });
            domMain.on('click', 'td', function(e) {
              e.preventDefault();
              $(domMain).find("tbody tr").removeClass("selected");
              var tr = $(this).closest('tr');
              tr.addClass('selected');
              var row = table.row(tr);
              $scope.selectTr = row.data().id;
              $scope.selectObj = row.data();
              $scope.$apply();
            });
            domMain.on('click', '#del-btn', function(e) {
              e.preventDefault();
              var tr = $(this).closest('tr');
              var row = table.row(tr);
              var rowData = row.data();
              $scope.delMod(rowData, function(flg) {
                if(flg)
                  row.remove().draw(false);
              });
            });
          }
        ]
      };
    }]);
    directives.initDirective('kpiListTable', ['$timeout', '$compile', 'growl', function($timeout, $compile, growl) {
      return {
        restrict: 'A',
        controller: ['$scope', '$element', '$attrs',
          function($scope, $element, $attrs) {
            var domMain = $element;
            var table;
            var isEditing = false;
            var itemAttrs;
            var groupInf;
            $scope.$on("KPI", function(event, args) {
              if(table) {
                table.destroy();
                domMain.empty();
              }
              isEditing = false;

              table = domMain.DataTable({
                dom: args && args.length > 0 ? $.ProudSmart.datatable.footerdom : '',
                language: $.ProudSmart.datatable.language,
                bAutoWidth: true,
                data: args,
                bProcessing: true,
                bPaginate: false,
                "bSort": false,
                "bInfo": false,
                //              "scrollY": 300,
                //              "scrollCollapse": true,
                columns: [{
                  data: "index",
                  title: "序号"
                }, {
                  data: "name",
                  title: "数据项"
                }, {
                  data: "label",
                  title: "名称"
                }, {
                  data: "unit",
                  title: "单位"
                }, {
                  data: "number",
                  title: "是否数值"
                }, {
                  data: "type",
                  title: "数据分类"
//              }, { //宝钢使用
//                data: "values",
//                title: "检测专业"
                }, {
                  data: "range",
                  title: "取值范围"
                }, {
                  data: "icon",
                  title: "图标"
                }, $.ProudSmart.datatable.optionCol2],
                columnDefs: [{
                  targets: 0,
                  data: "index",
                  render: function(data, type, full) {
                    if ($scope.isIndexEdit && type == "display")
                      return "<input style='width:40px' class='form-control input-sm index-edit-input' type='number' value='" + data + "'>";
                    else
                      return data;
                  }
                }, {
                  targets: 1,
                  data: "name",
                  render: function(data, type, full) {
                    return escape(data);
                  }
                }, {
                  targets: 2,
                  data: "label",
                  render: function(data, type, full) {
                    return escape(data);
                  }
                }, {
                  targets: 3,
                  data: "unit",
                  render: function(data, type, full) {
                    var str = '';
                    if($scope.myOptionDic[data]) {
                      str = $scope.myOptionDic[data];
                    }
                    return str;
                  }
                }, {
                  targets: 4,
                  data: "number",
                  render: function(data, type, full) {
                    var str = '';
                    if(data) {
                      str = '是';
                    } else {
                      str = '否';
                    }
                    return str;
                  }
                }, {
                  targets: 5,
                  data: "type",
                  render: function(data, type, full) {
                    var str = '';
                    if(data == 'kpi'){
                      str = '测点';
                    }else if(data == 'fault'){
                      str = '故障';
                    }
                    return str;
                  }
                }, {
                  targets: 6,
                  data: "range",
                  render: function(data, type, full) {
                    return escape(data);
                  }
//              }, { //宝钢使用
//                targets: 4,
//                data: "values",
//                render: function(data, type, full) {
//                  var str = "";
//                  if(data) {
//                    str = $scope.specialtyPropsDic[data.specialtyProp];
//                  }
//                  return str;
//                }
                }, {
                  targets: 7,
                  data: "icon",
                  render: function(data, type, full) {
                    var str = '';
                    if(data) {
                      str = '<div  class="btn btn-social-icon btn-bitbucket btn-sm"><i  class="' + data + '"></i>';
                    }
                    return str;
                  }
                }, {
                  targets: 8,
                  data: "option",
                  render: function(data, type, full) {
                    // 返回自定义内容
                    var str = "<div class='btn-group btn-group-sm'>";
                    if($scope.menuitems['D04_A08']) {
                      str += "<button id='edit-btn' class='btn btn-primary' ><i class='fa fa-edit hidden-lg hidden-md hidden-sm'></i><span class='hidden-xs'> 修改</span></button>"
                    }
                    if($scope.menuitems['D03_A08']) {
                      str += "<button id='del-btn' class='btn btn-default' ><i class='fa fa-minus hidden-lg hidden-md hidden-sm'></i><span class='hidden-xs'> 删除</span></button>"
                    }
                    str += "</div>"
                    return str;
                  }
                }],
                rowCallback: function(nRow, aData, iDataIndex) {
                  $compile(nRow)($scope);
                }
              })
            });

            $scope.$on("table-search-handle", function(event, args) {
              if(args.name == $attrs.name)
                table.search(args.value).draw();
            });

            domMain.on('click', '#edit-btn', function(e) {
              e.preventDefault();
              isEditing = true;
              var tr = $(this).closest('tr');
              var row = table.row(tr);
              $scope.addData('upd', row.data());

            });

            domMain.on('click', '#del-btn', function(e) {
              e.preventDefault();
              var tr = $(this).closest('tr');
              var row = table.row(tr);
              var rowData = row.data();
              $scope.deleteAction("kpi", rowData, function(flg) {
                if(flg) {
                  row.remove().draw(false);
                }
              });
            });
            domMain.on('change', '.index-edit-input', function(e) {
              e.stopPropagation();
              var tr = $(this).closest('tr');
              var row = table.row(tr);
              row.data()["index"] = $(this).val();
            });
          }
        ]
      };
    }]);


    directives.initDirective('setTable', ['$timeout', '$compile', 'growl', function($timeout, $compile, growl) {
      return {
        restrict: 'A',
        controller: ['$scope', '$element', '$attrs',
          function($scope, $element, $attrs) {
            var domMain = $element;
            var table;
            var isEditing = false;
            var itemAttrs;
            var groupInf;
            $scope.$on("SET", function(event, args) {
              if(table) {
                table.destroy();
                domMain.empty();
              }
              isEditing = false;

              table = domMain.DataTable({
                dom: args && args.length > 0 ? $.ProudSmart.datatable.footerdom : '',
                language: $.ProudSmart.datatable.language,
                bAutoWidth: true,
                data: args.data,
                bProcessing: true,
                bPaginate: false,
                "bSort": false,
                "bInfo": false,
                //              "scrollY": 300,
                //              "scrollCollapse": true,
                columns: [{
                  data: "name",
                  title: "数据项"
                }, {
                  data: "label",
                  title: "名称"
                }, {
                  data: "unit",
                  title: "单位"
                }, {
                  data: "number",
                  title: "是否数值"
                }, {
                  data: "type",
                  title: "数据分类"
//              }, { //宝钢使用
//                data: "values",
//                title: "检测专业"
                }, {
                  data: "range",
                  title: "取值范围"
                }
                  , {
                  data: "icon",
                  title: "图标"
                }
                  //, $.ProudSmart.datatable.optionCol2

                ],
                columnDefs: [{
                  targets: 0,
                  data: "name",
                  render: function(data, type, full) {
                    return escape(data);
                  }
                }, {
                  targets: 1,
                  data: "label",
                  render: function(data, type, full) {
                    return escape(data);
                  }
                }, {
                  targets: 2,
                  data: "unit",
                  render: function(data, type, full) {
                    var str = '';
                    if($scope.myOptionDic[data]) {
                      str = $scope.myOptionDic[data];
                    }
                    return str;
                  }
                }, {
                  targets: 3,
                  data: "number",
                  render: function(data, type, full) {
                    var str = '';
                    if(data) {
                      str = '是';
                    } else {
                      str = '否';
                    }
                    return str;
                  }
                }, {
                  targets: 4,
                  data: "type",
                  render: function(data, type, full) {
                    var str = '';
                    if(data == 'kpi'){
                      str = '测点';
                    }else if(data == 'fault'){
                      str = '故障';
                    }
                    return str;
                  }
//              }, { //宝钢使用
//                targets: 4,
//                data: "values",
//                render: function(data, type, full) {
//                  var str = "";
//                  if(data) {
//                    str = $scope.specialtyPropsDic[data.specialtyProp];
//                  }
//                  return str;
//                }
                }, {
                  targets: 6,
                  data: "icon",
                  render: function(data, type, full) {
                    var str = '';
                    if(data) {
                      str = '<div  class="btn btn-social-icon btn-bitbucket btn-sm"><i  class="' + data + '"></i>';
                    }
                    return str;
                  }
                }
                //  , {
                //  targets: 7,
                //  data: "option",
                //  render: function(data, type, full) {
                //    // 返回自定义内容
                //    var str = "<div class='btn-group btn-group-sm'>";
                //    if($scope.menuitems['D04_A08']) {
                //      str += "<button id='edit-btn' class='btn btn-primary' ><i class='fa fa-edit hidden-lg hidden-md hidden-sm'></i><span class='hidden-xs'> 修改</span></button>"
                //    }
                //    if($scope.menuitems['D03_A08']) {
                //      str += "<button id='del-btn' class='btn btn-default' ><i class='fa fa-minus hidden-lg hidden-md hidden-sm'></i><span class='hidden-xs'> 删除</span></button>"
                //    }
                //    str += "</div>"
                //    return str;
                //  }
                //}

                ],
                rowCallback: function(nRow, aData, iDataIndex) {
                  $compile(nRow)($scope);
                }
              })
            });

            $scope.$on("table-search-handle", function(event, args) {
              if(args.name == $attrs.name)
                table.search(args.value).draw();
            });

            domMain.on('click', '#edit-btn', function(e) {
              e.preventDefault();
              isEditing = true;
              var tr = $(this).closest('tr');
              var row = table.row(tr);
              $scope.addData('upd', row.data());

            });

            domMain.on('click', '#del-btn', function(e) {
              e.preventDefault();
              var tr = $(this).closest('tr');
              var row = table.row(tr);
              var rowData = row.data();
              $scope.deleteAction("kpi", rowData, function(flg) {
                if(flg) {
                  row.remove().draw(false);
                }
              });
            });
          }
        ]
      };
    }]);

    directives.initDirective('gatherListTable', ['$timeout', '$compile', 'growl', function($timeout, $compile, growl) {
      return {
        restrict: 'A',
        controller: ['$scope', '$element', '$attrs',
          function($scope, $element, $attrs) {
            var domMain = $element;
            var table;
            var isEditing = false;
            var itemAttrs;
            var groupInf;
            $scope.$on("GATHER", function(event, args) {
              if(table) {
                table.destroy();
                domMain.empty();
              }
              isEditing = false;

              table = domMain.DataTable({
                dom: args && args.length > 0 ? $.ProudSmart.datatable.footerdom : '',
                language: $.ProudSmart.datatable.language,
                bAutoWidth: true,
                data: args.data,
                bProcessing: true,
                bPaginate: false,
                "bSort": false,
                "bInfo": false,
                //              "scrollY": 300,
                //              "scrollCollapse": true,
                columns: [{
                  data: "taskCode",
                  title: "分组编码"
                }, {
                  data: "description",
                  title: "分组描述"
                }, {
                  data: "taskCycle",
                  title: "采集周期"
                }, {
                  data: "cycleUnit",
                  title: "采集单位"
                }
                  //, $.ProudSmart.datatable.optionCol2
                ],


                columnDefs: [{
                  targets: 0,
                  data: "taskCode",
                  render: function(data, type, full) {
                    return escape(data);
                  }
                }, {
                  targets: 1,
                  data: "description",
                  render: function(data, type, full) {
                    return escape(data);
                  }
                }, {
                  targets: 2,
                  data: "taskCycle",
                  render: function(data, type, full) {
                    return escape(data);
                    //var str = '';
                    //if($scope.myOptionDic[data]) {
                    //  str = $scope.myOptionDic[data];
                    //}
                    //return str;
                  }
                }, {
                  targets: 3,
                  data: "cycleUnit",
                  render: function(data, type, full) {
                    return escape(data);
                    //var str = '';
                    //if(data) {
                    //  str = '是';
                    //} else {
                    //  str = '否';
                    //}
                    //return str;
                  }
                }
                //  , {
                //  targets: 4,
                //  data: "cycleUnit",
                //  render: function(data, type, full) {
                //    return escape(data);
                //    //var str = '';
                //    //if(data == 'kpi'){
                //    //  str = '测点';
                //    //}else if(data == 'fault'){
                //    //  str = '故障';
                //    //}
                //    //return str;
                //  }
                //},
                  //{
                  //targets: 6,
                  //data: "icon",
                  //render: function(data, type, full) {
                  //  var str = '';
                  //  if(data) {
                  //    str = '<div  class="btn btn-social-icon btn-bitbucket btn-sm"><i  class="' + data + '"></i>';
                  //  }
                  //  return str;
                //  targets: 5,
                //  data: "option",
                //  render: function(data, type, full) {
                //    // 返回自定义内容
                //    var str = "<div class='btn-group btn-group-sm'>";
                //    if($scope.menuitems['D04_A08']) {
                //      str += "<button id='edit-btn' class='btn btn-primary' ><i class='fa fa-edit hidden-lg hidden-md hidden-sm'></i><span class='hidden-xs'> 编辑</span></button>"
                //    }
                //    if($scope.menuitems['D03_A08']) {
                //      str += "<button id='del-btn' class='btn btn-default' ><i class='fa fa-minus hidden-lg hidden-md hidden-sm'></i><span class='hidden-xs'> 删除</span></button>"
                //    }
                //    str += "</div>"
                //    return str;
                //  }
                //
                //
                //},

                //  {
                //  targets: 7,
                //  data: "option",
                //  render: function(data, type, full) {
                //    // 返回自定义内容
                //    var str = "<div class='btn-group btn-group-sm'>";
                //    if($scope.menuitems['D04_A08']) {
                //      str += "<button id='edit-btn' class='btn btn-primary' ><i class='fa fa-edit hidden-lg hidden-md hidden-sm'></i><span class='hidden-xs'> 编辑</span></button>"
                //    }
                //    if($scope.menuitems['D03_A08']) {
                //      str += "<button id='del-btn' class='btn btn-default' ><i class='fa fa-minus hidden-lg hidden-md hidden-sm'></i><span class='hidden-xs'> 删除</span></button>"
                //    }
                //    str += "</div>"
                //    return str;
                //  }
                //}

                ],
                rowCallback: function(nRow, aData, iDataIndex) {
                  $compile(nRow)($scope);
                }
              })
            });


            $scope.$on("table-search-handle", function(event, args) {
              if(args.name == $attrs.name)
                table.search(args.value).draw();
            });

            domMain.on('click', '#edit-btn', function(e) {
              e.preventDefault();
              isEditing = true;
              var tr = $(this).closest('tr');
              var row = table.row(tr);
              $scope.addData('upd', row.data());

            });

            domMain.on('click', '#del-btn', function(e) {
              e.preventDefault();
              var tr = $(this).closest('tr');
              var row = table.row(tr);
              var rowData = row.data();
              $scope.deleteAction("kpi", rowData, function(flg) {
                if(flg) {
                  row.remove().draw(false);
                }
              });
            });
          }
        ]
      };
    }]);

  }
)