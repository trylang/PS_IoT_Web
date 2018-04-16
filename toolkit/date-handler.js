/**
 * Created by leonlin on 16/11/3.
 */
define([], function(){
  var dataHandler = {};
  dataHandler.init = function(dateStr){
    var date, year, month, dat, hour, minute, second, events = {};
    var OFFSET = "0800";
    function DateHandler(dateStr){
      var cur = this;
      this.version = "DateHandler v1.0.0";
      this.CLASS = "DateHandler";
      if(dateStr){
        //console.log(dateStr, new Date(dateStr));
        if(typeof dateStr == "object"){
          cur.setDate(dateStr);
        } else {
          cur.setDate(new Date(dateStr));
        }
      } else {
        cur.setDate(new Date());
      };
      cur.on("dateChange", function(d){
        cur.setDate(d);
      });
    };
    var dateToStr = function(){
      str = year + "-" + to2Char(month + 1) + "-" + to2Char(dat) + ":" + to2Char(hour) + ":" + to2Char(minute) + ":" + to2Char(second) + ".000+" + OFFSET;
      return str;
    };
    var to2Char = function(num){
      if(num < 10){
        return "0" + num
      } else {
        return num;
      }
    };
    DateHandler.prototype.setDate = function(d){
      date = d;
      year = date.getFullYear();
      month = date.getMonth();
      dat = date.getDate();
      hour = date.getHours();
      minute = date.getMinutes();
      second = date.getSeconds();
      this.date = dateToStr();
    };
    DateHandler.prototype.on = function(eventName, callback){
      events[eventName] = callback
    };
    var update = function(){
      date = new Date(dateToStr());
      events['dateChange'](date);
    };
    DateHandler.prototype.addYear = function(num){
      year = year + num;
      update();
      return this.clone();
    };
    DateHandler.prototype.minus = function(target){
      var cur = this;
      return cur.getTimeStamp() - target.getTimeStamp();
    };
    DateHandler.prototype.addMonth = function(num){
      var m = month + parseInt(num);
      var yadd = Math.floor(m / 12);
      var madd = m % 12
      year = year + yadd;
      month = madd;
      update();
      return this.clone();
    };
    DateHandler.prototype.clone = function(){
      return dataHandler.init(this.getTimeStamp());
    };
    DateHandler.prototype.addTimeStamp = function(timestamp){
      var minSecond = date.getTime() + timestamp;
      this.setDate(new Date(minSecond));
      return this.clone();
    };
    DateHandler.prototype.addDay = function(num){
      var dateMinSecond = 24 * 3600 * 1000 * num;
      this.addTimeStamp(dateMinSecond);
      return this.clone();
    };
    DateHandler.prototype.addHour = function(num){
      var dateMinSecond = 3600 * 1000 * num;
      this.addTimeStamp(dateMinSecond);
      return this.clone();
    };
    DateHandler.prototype.addMinute = function(num){
      var dateMinSecond = 60 * 1000 * num;
      this.addTimeStamp(dateMinSecond);
      return this.clone();
    };
    DateHandler.prototype.addSecond = function(num){
      var dateMinSecond = 1000 * num;
      this.addTimeStamp(dateMinSecond);
      return this.clone();
    };
    DateHandler.prototype.getTime = DateHandler.prototype.getTimeStamp = function(){
      return date.getTime();
    };
    DateHandler.prototype.getDate = function(){
      return date;
    };
    DateHandler.prototype.before = function(dt){
      var cur = this;
      var rs;
      if(dt.CLASS == "DateHandler"){
        rs = cur.getTimeStamp() < dt.getTimeStamp();
      } else {
        rs = cur.getTimeStamp() < dataHandler.init(dt).getTimeStamp();
      };
      return rs;
    };
    DateHandler.prototype.after = function(dt){
      var cur = this;
      var rs;
      if(dt.CLASS == "DateHandler"){
        rs = cur.getTimeStamp() > dt.getTimeStamp();
      } else {
        rs = cur.getTimeStamp() > dataHandler.init(dt).getTimeStamp();
      };
      return rs;
    };
    DateHandler.prototype.trimmToYear = function(){
      return year + "-01-01,00;00:00.000+" + OFFSET;
    };
    DateHandler.prototype.trimmToMonth = function(){
      return year + "-" + to2Char(month + 1) + "-01,00:00:00.000+" + OFFSET;
    };
    DateHandler.prototype.trimmToDate = function(){
      return year + "-" + to2Char(month + 1) + "-" + to2Char(dat) + ",00:00:00.000+" + OFFSET;
    };
    DateHandler.prototype.trimmToHour = function(){
      return year + "-" + to2Char(month + 1) + "-" + to2Char(dat) + "," + to2Char(hour) + ":00:00.000+" + OFFSET;
    };
    DateHandler.prototype.trimmToMinute = function(){
      return year + "-" + to2Char(month + 1) + "-" + to2Char(dat) + "," + to2Char(hour) + ":" + to2Char(minute) + ":00.000+" + OFFSET;
    };
    DateHandler.prototype.trimmToSecond = function(){
      return year + "-" + to2Char(month + 1) + "-" + to2Char(dat) + "," + to2Char(hour) + ":" + to2Char(minute) + ":" + to2Char(second) + ".000+" + OFFSET;
    };
    DateHandler.prototype.getDateString = function(str){
      if(str){
        str = str.replace(/y+/g, year);
        str = str.replace(/M+/g, to2Char(month + 1));
        str = str.replace(/d+/g, to2Char(dat));
        str = str.replace(/h+/g, to2Char(hour));
        str = str.replace(/m+/g, to2Char(minute));
        return str.replace(/s+/g, to2Char(second));
      } else {
        return year + "-" + to2Char(month + 1) + "-" + to2Char(dat) + "," + to2Char(hour) + ":" + to2Char(minute) + ":" + to2Char(second) + ".000+" + OFFSET;
      }
    };
    var rs = new DateHandler(dateStr);
    return rs;
  };
  return dataHandler;
});
