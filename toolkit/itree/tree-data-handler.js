/**
 * Created by leonlin on 16/11/3.
 */
define([], function(){
  return {
    init : function(dt, format){
      var Node = function(data){
        if(format){
          var traverseFn = format.traverse;
          var repeat = function(element){
            if(traverseFn){
              traverseFn(element);
            };
            if(element.hasOwnProperty(format["children"])){
              element.children = element[format["children"]]
              for(var i in element.children){
                repeat(element.children[i])
              }
            }
          };
          repeat(data);
        };
        this.$clone(data);
      };
      var repeat = function(children, inx, parent, lv){
        children[inx] = new Node(children[inx]);
        Object.defineProperties(children[inx], {
          'level': {
            value: lv,
            enumerable: false
          },
          'parent': {
            value: parent,
            enumerable: false
          }
        });
        if(children[inx].hasOwnProperty("children")){
          for(var i in children[inx].children){
            repeat(children[inx].children, i, children[inx], lv + 1)
          }
        }
      };
      Node.prototype.traverse = function(callback){
        var cur = this;
        var repeat = function(element){
          if(callback){
            callback(element);
          }
          if(element.hasOwnProperty("children")){
            for(var i in element.children){
              repeat(element.children[i])
            }
          }
        };
        repeat(cur);
      };
      Node.prototype.isLast = function(){
        var parent = this.parent;
        return parent.children.indexOf(this) == parent.children.length - 1;
      };
      Node.prototype.traverseParents = function(callback){
        var repeat = function(element){
          if(element){
            if(callback){
              callback(element);
            };
            repeat(element.parent);
          }
        };
        repeat(this.parent);
      };
      Node.prototype.traverseChildren = function(callback){
        for(var i in this.children){
          callback(this.children[i]);
        }
      };
      Node.prototype.getChildren = function(callback){
        var rs = [];
        callback = callback || function(){
            return true;
          }
        for(var i in this.children){
          if(callback(this.children[i])){
            rs.push(this.children[i]);
          };
        }
        return rs;
      };
      Node.prototype.traverseBrothers = function(callback){
        var parent = this.parent;
        for(var i in parent.children){
          if(parent.children[i] != this){
            callback(parent.children[i]);
          }
        }
      };
      Node.prototype.addChildren = function(child){
        var node = this;
        node.children.push(child);
        var inx = node.children.indexOf(child);
        repeat(node.children, inx, node, node.level + 1);
      };
      Node.prototype.updateChildren = function(children){
        var node = this;
        node.children = children;
        for(var i in node.children){
          repeat(node.children, i, node, node.level + 1);
        }
      };
      /**
      Node.prototype.getDescendants = function(callback){
        var cur = this;
        var rs = [];
        var repeat = function(element){
          callback = callback || function(){
              return true;
            }
          if(callback(element)){
            rs.push(element);
          }
          if(element.hasOwnProperty("children")){
            for(var i in element.children){
              repeat(element.children[i])
            }
          }
        };
        if(cur.hasOwnProperty("children")){
          for(var i in cur.children){
            repeat(cur.children[i])
          }
        };
        return rs;
      };*/
      Node.prototype.hasDescendant = function(target){
        var some = false;
        this.traverseDescendants(function(node){
          if(target == node){
            some = true;
          };
        });
        return some;
      };
      Node.prototype.getDescendants = function(callback){
        var cur = this;
        var rs = []
        callback = callback || function(){ return true; }
        var repeat = function(element){
          if(callback(element)){
            rs.push(element);
          }
          if(element.hasOwnProperty("children")){
            for(var i in element.children){
              repeat(element.children[i])
            }
          }
        };
        if(cur.hasOwnProperty("children")){
          for(var i in cur.children){
            repeat(cur.children[i])
          }
        };
        return rs;
      };
      Node.prototype.traverseDescendants = function(callback){
        var cur = this;
        var repeat = function(element){
          if(callback){
            callback(element);
          }
          if(element.hasOwnProperty("children")){
            for(var i in element.children){
              repeat(element.children[i])
            }
          }
        };
        if(cur.hasOwnProperty("children")){
          for(var i in cur.children){
            repeat(cur.children[i])
          }
        };
      };
      var rootNode = new Node(dt);
      Object.defineProperties(rootNode, {
        'level': {
          value: 0,
          enumerable: false
        },
        'parent': {
          value: null,
          enumerable: false
        }
      });
      for(var i in rootNode.children){
        repeat(rootNode.children, i, rootNode, 1);
      }
      return rootNode;
    }
  };
});