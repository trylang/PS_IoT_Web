define(['directives/directives', 'bootstrap-dialog', 'datatables.net', 'datatables.net-bs', 'datatables.net-select'],
  function(directives, BootstrapDialog, datatables) {

  directives.initDirective('workOrderRecord', ['$timeout', '$compile', function($timeout, $compile) {
    return {
      restrict: 'A',
      controller: ['$scope', '$element', '$attrs',
        function($scope, $element, $attrs) {
          var domMain = $element;
          var table;
          var state = "";
          $scope.$on(Event.WORKORDERRECORDINIT, function(event, args) {
            if (table) {
              table.destroy();
              domMain.empty();
            }
            state = args.state;
            table = domMain.DataTable({
              dom: args.data && args.data.length > 0 ? $.ProudSmart.datatable.footerdom : '',
              language: $.ProudSmart.datatable.language,
              data: args.data,
              columns: args.columns,
              "order": [6, "desc"],
              columnDefs: args.columnDefs
            });
          });
          domMain.on('click', '#process', function(e) {
            var tr = $(this).closest('tr');
            var row = table.row(tr);
            var dataList = row.data();
            location.href = "../app-flowsheet/index.html#/processView/" + dataList.id
          });
          domMain.on('click', '#history', function(e) {
            var tr = $(this).closest('tr');
            var row = table.row(tr);
            var dataList = row.data();

          });
          domMain.on('click', 'td', function(e) {
            e.preventDefault();
            var name = $(this).text();
            var tr = $(this).closest('tr');
            var row = table.row(tr);
            var dataList = row.data();
            var sear='执行历史';
             if(($scope.menuitems['A03_S08'] || $scope.menuitems['A02_S09']) && name.indexOf(sear) == -1){
              $scope.herfList(name, dataList, state);
             }
          });
        }
      ]
    }
  }]);
  directives.initDirective('historyTable', ['$timeout', '$compile', function($timeout,$compile) {
    return {
      restrict: 'A',
      controller: ['$scope', '$element', '$attrs',
        function($scope, $element, $attrs) {
          var domMain = $element;
          var table;
          var isEditing = false;
            // $scope.$on(Event.CMDBINFOSINIT+"_shadows", function(event, args) {
          $scope.$on(Event.WORKORDERRECORDINIT+"_history", function(event, args) {
            if (table) {
              table.destroy();
            }
            isEditing = false;
            table = domMain.DataTable({
              dom: args.data && args.data.length > 0 ? $.ProudSmart.datatable.footerdom : '',
              language: $.ProudSmart.datatable.language,
              data: args.data,
              columns: args.columns,
              columnDefs: args.columnDefs
            });
          });
        }
      ]
    };
  }]);

  //处理任务---关联备件
  directives.initDirective('majorDeviceTable', ['$timeout', '$compile', function($timeout, $compile) {
    return {
      restrict: 'A',
      controller: ['$scope', '$element', '$attrs',
        function($scope, $element, $attrs) {
          var domMain = $element;
          var table;
          var isEditing = false;

          $scope.$on(Event.WORKORDERRECORDINIT+"_deviceTask", function(event, args) {
            if (table) {
              table.destroy();
            }

            isEditing = false;
            table = domMain.DataTable({
              dom: args.data && args.data.length > 0 ? $.ProudSmart.datatable.footerdom : '',
              language: $.ProudSmart.datatable.language,
              data: args.data,
              rowCallback: function(nRow, aData, iDataIndex) {
                $compile(nRow)($scope);
              },
              columns: [{
                title: "备件编号",
                data: "name",
                orderable:false
              }, {
                title: "备件名称",
                data: "label",
                orderable:false
              },{
                title: "数量",
                data: "stockNumber",
                orderable:false
              },{
                title: "操作",
                visible: $scope.detail.taskStatus != 200,
                data: "option",
                orderable:false
              }],
              columnDefs: [{
                "targets": 0,
                "data": "name",
                "render": function(data, type, full) {
                  // 返回自定义内容
                  var str = "";
                  if (full.isEdit == 3  && type == "display") {
                    str += '<select id="allSpare" name="allSpare" class="combobox form-control input-sm" ng-model="definitions.selectList" ng-change="saveAttachment(definitions.selectList);" ng-options="pro as pro.name for  pro in selectList.allSpareParts">';
                    str += '<option value="">请选择...</option>';
                    str += '</select>';
                  } else {
                    str = "<a href='#sparepartInfo/"+full.id+"'>"+data+"</a>";
                  }
                  return str;
                }
              },{
                "targets": 1,
                "data": "label",
                "render": function(data, type, full) {
                  return data;
                }
              },{
                "targets": 2,
                "data": "stockNumber",
                "render": function (data, type, full) {
                  if (full.isEdit > 0  && type == "display") {
                    return data;
                  } else {
                    if ($scope.detail.taskStatus != 200 ) {
                      if($scope.sparePartsArray[full.id] != undefined){
                        return "<input class='form-control col-xs-6'  name='" + full.id + "' id='stockName' ng-model='sparePartsArray["+full.id+"].editNumber'  type='text'  maxlength='20'  value='"+data+"'  style='border: 1px solid #F18282;width: 100%;' placeholder='当前库存数量："+$scope.sparePartsArray[full.id].stockNumber+"'>";
                      }else{
                        return "<input class='form-control col-xs-6'  name='" + full.id + "' id='stockName' type='text'  maxlength='20'  style='border: 1px solid #F18282;width: 100%;' placeholder='当前库存数量："+data+"'>";
                      }
                    } else {
                      return data;
                    }
                  }
                }
              },{
                "targets": 3,
                "data": "option",
                "render": function (data, type, full) {
                  // 返回自定义内容
                  var str = "<div class='btn-group ' >";
                  //if (full.isEdit == 3) {
                  //  str += "<a id='save-btn' class='btn btn-default btn-sm' style='margin-right: 10px;'><i class='fa fa-save  hidden-lg hidden-md hidden-sm'></i><span class='hidden-xs'> 保存</span></a>";
                  //  str += "<a id='cancel-btn' class='btn btn-default btn-sm' ><i class='fa fa-times hidden-lg hidden-md hidden-sm '></i><span class='hidden-xs'> 取消</span></a>";
                  //} else {
                    if ($scope.detail.taskStatus != 200 && full.isEdit != 3) {
                      str += "<a id='del-btn' ng-show='detail.taskStatus != 200' class='btn btn-default btn-sm' ><i class='fa fa-times hidden-lg hidden-md hidden-sm '></i><span class='hidden-xs'> 删除</span></a>";
                    }
                  //}
                  str += "</div>";
                  return str;
                }
              }]
            });
          });
          ///**
          // * 监听表格初始化后，添加按钮
          // */
          //domMain.on('init.dt', function () {
          //  var parentDom = $(".special-btn").parent();
          //  parentDom.html('<a ng-click="addAttachment()" ng-show="detail.taskStatus != 200 && selectList.ticketStatus != false " class="btn btn-default btn-sm"><i class="fa fa-plus"></i><span class="hidden-xs"> 选择备件</span></a>');
          //  $compile(parentDom)($scope);
          //});
          /**
           * 监听表格初始化后，添加按钮
           */
          domMain.on('init.dt', function() {
          /*  var parentDom = $(".special-btn").parent();
            //          parentDom.html('<a ng-click="addFault()" class="btn btn-default btn-sm"><i class="fa fa-plus"></i><span class="hidden-xs"> 添加故障</span></a>');
            if($scope.detail.taskStatus != 200 && $scope.selectList.ticketStatus != false ){
              parentDom.html('<select class="form-control" style="min-width:200px" selectdata="allSpareParts" itemchange="saveAttachment" select2></select>');
            }
            $compile(parentDom)($scope);*/
          });
          domMain.on('click', '#save-btn', function (e) {
            e.stopPropagation();
            var tr = $(this).closest('tr');
            var row = table.row(tr);
            var rowData = row.data();
            var divs2= $scope.selectList.allSpareParts;

            var put = $("#allSpare option:selected").val();
            if(put == "" && put == null){
              return;
            }else{
              for(var i in divs2){
                if(divs2[i].id == put){
                  $scope.saveAttachment(divs2[i]);
                  break;
                }

              }
            }
          });

          domMain.on('click', '#cancel-btn', function(e) {
            e.stopPropagation();
            isEditing = false;
            var tr = $(this).closest('tr');
            var row = table.row(tr);
            $scope.cancelAttach(row.data());
          });
          domMain.on('click', '#del-btn', function(e) {
            e.stopPropagation();
            isEditing = false;
            var tr = $(this).closest('tr');
            var row = table.row(tr);
            $scope.cancelAttach( row.data());
          });


        }
      ]
    }
  }]);
});
