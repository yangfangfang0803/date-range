<template lang="html">
  <div class="dateBox" @click.stop="showSelectWin()" :class="{'active':winstatus}">
    <span>{{dateTxt}}</span>
    <i class="cret"></i>
    <div class="dateWrap" v-show="winstatus" :class="{'toright':layRight,'single':single}">
      <div class="btnWrap" v-if="!single">
        <a href="javascript:void(0)" class="btn" v-for="(value,key) in relDayList" @click.stop="changelRelDate(key)" :class="{'active':activerel==key}">{{value}}</a>
      </div>

      <div class="tableWrap">
        <div class="date-info">
          <div class="date-single" v-for="(panel,index) in dateList" v-if="!single || (single && index==1)">
            <div class="date-title">
              <span class="date-pre"><span class="date_pre" v-if="index==0 || single" @click.stop="changeMonths(panel.date,-1)"></span></span>
              <span class="date-label">{{panel.date | fmtdate('yyyy-MM')}}</span>
              <span class="date-next"><span class="date_next" v-if="index==1 || single" @click.stop="changeMonths(panel.date,1)"></span></span>
            </div>
            <table class="date-table">
              <thead>
                <tr>
                  <th v-for='name in weeknames'>{{name}}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for='row in panel.weeks'>
                  <td v-for='cell in row'>
                    <a href="javascript:void(0)" :class="[cellClass(cell)]" @click.stop="chooseDate(cell)">{{cell.day | fmtdate('d')}}</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="date-footer" v-if="!single">
          <div class="footer-txt">
            <label>日期范围:</label>
            <input type="text" v-model="start_txt">
            <label>至</label>
            <input type="text" v-model="end_txt">
          </div>
          <div class="footer-btn">
            <a href="javascript:void(0)" class="btn prybtn" @click.stop="completeDate()">确定</a>
            <a href="javascript:void(0)" class="btn" @click.stop="cancelDate()">取消</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DateUtil from '@/util/DateUtil'

let relDays = {
  '-d1':'昨日',
  'd0':'今日',
  '-d7':'近7天',
  '-d14':'近14天',
  '-d30':'近30天',
  '-w1':'上周',
  'w0':'本周',
  '-m1':'上月',
  'm0':'本月',
  '-q1':'上季度',
  'q0':'本季度',
  '-y1':'去年',
  'y0':'本年'
}
export default {
  name: 'DateSelect',
  props:{
    minTime: { //最小可选日期
      type: String,
      default: '1977-12-01'
    },
    maxFlag: { //0最大可选为今天，-1为最大可选为昨天，以此类推
      type: Number,
      default: 0
    },
    initTime: { //初始化日期
      type: Object
    },
    emitname: { //传递参数名称
      type: String,
      default: 'rangeDate'
    },
    rangeds: {  //-1不限制天数
      type: Number,
      default: -1
    },
    layRight: {//默认显示在左侧
      type: Boolean,
      default: false
    },
    single:{//单日期框
      type:Boolean,
      default:false
    }
  },
  data: function () {
      let date = new Date(),
          minDate = new Date(this.minTime).addDays(-1),
          maxDate = date.clone().addDays(this.maxFlag),
          startDate = date,endDate = date;

      if(this.initTime){
        startDate = this.initTime.startDate;
        endDate = this.initTime.endDate;
      }
      else{
        endDate = date.isAfter(maxDate) ? maxDate.clone() : date.clone();
        startDate = date.isBefore(minDate) ? minDate.clone() : endDate.clone();
      }

      return {
        currentDate: endDate.clone(),
        maxM:2,
        maxDate: maxDate, //可选最大日期
        minDate: minDate, //可选最小日期
        dateList: [],
        startDate: startDate, //开始日期
        endDate: endDate, //结束日期
        weeknames: ['日', '一', '二', '三', '四', '五', '六'],
        chooseCounts: 0,
        beginDate: startDate,
        overDate: endDate,
        winstatus: false,
        relDayList: relDays,
        cancelFn:null,
        winID: Math.random()
      };
  },
  computed: {
    dateTxt: function () {
      if(this.single){
        return this.startDate.Format()
      }
      else{
        return this.startDate.Format() + '至' + this.endDate.Format()
      }
    },
    start_txt: function () {
      return this.beginDate.Format();
    },
    end_txt: function () {
      return this.overDate.Format();
    },
    activerel: function (){
       let rel = "";
       for(let key in this.relDayList){
         let range = this.changelRelDate(key,true);
         if(range.startDate.isSameDay(this.beginDate) && range.endDate.isSameDay(this.overDate)){
           rel = key;
           break;
         }
       }
       return rel;
    }
  },
  mounted: function () {
    for(var i=0;i<this.maxM;i++){
      this.getOneMonthDays(-i);
    }

    this.$nextTick(function(){
      //dom操作
    })
  },
  methods: {
    showSelectWin: function () {
      this.winstatus = true;

      this.cancelFn = () => {
        this.hideSelectWin();
      }
      document.addEventListener("click",this.cancelFn,false);
    },
    hideSelectWin: function (){
      this.winstatus = false;
      document.removeEventListener("click",this.cancelFn,false);
    },
    changeMonths: function (date,flag){//flag:1往后，-1往前
      if(flag > 0){
        this.dateList.shift();
      }
      else if(flag < 0){
        this.dateList.pop();
      }
      this.currentDate = this.dateList[0].date;
      this.getOneMonthDays(flag);
    },
    getOneMonthDays: function (flag) {
       let weeks = [],
          dateM = this.currentDate.clone().addMonths(flag), //月面板
          firstDay = Date.getFirstDay(dateM), //当月第一天
          firstWeekDay = firstDay.getDay(),//当月的一个星期
          daysOfMonth = Date.getDaysInMonth(dateM.getFullYear(), dateM.getMonth()), //该月有几天
          rowNums = Math.ceil((firstWeekDay + daysOfMonth) / 7), //该月日历的行数
		      curDate = firstDay.clone().addDays(-firstWeekDay); //循环遍历的日期

        for (var i = 0; i < rowNums; i++) {
            var days = [];
            for (var j = 0; j < 7; j++) {
                var tmp = curDate.clone();
                days.push({
                    day: tmp,
                    other: tmp.getMonth() != dateM.getMonth(),
                });
                curDate = curDate.addDays(1);
            }

            weeks.push(days);
        }
        var panel = {date: dateM,weeks: weeks};
        if(flag > 0){
          this.dateList.push(panel);
        }
        else if(flag < 0){
          this.dateList.unshift(panel);
        }
        else{
          this.dateList.push(panel);
        }
    },
    cellClass: function (cell) {
    	if(cell.other){
    		return "other-month";
    	}
    	else if(cell.day.isSameDay(this.beginDate) || cell.day.isSameDay(this.overDate)){
    		return "start_end";
    	}
    	else if(cell.day.between(this.beginDate, this.overDate)){
    		return "choose";
    	}
    	else if(cell.day.isAfter(this.maxDate) || cell.day.isBefore(this.minDate)){
    		return "disabled";
    	}
    	else{
    		return "";
    	}
    },
    chooseDate: function (cell) {
      if (cell.day.isAfter(this.maxDate)  || cell.day.isBefore(this.minDate)) {
          return;
      }

      if(this.single){
        this.beginDate = this.endDate = this.overDate = this.startDate = cell.day;
        this.completeDate();
      }
      else{
        this.chooseCounts = this.chooseCounts>=2 ? 0 : this.chooseCounts;
        this.chooseCounts ++;

        if (this.chooseCounts === 1) {
            this.beginDate = this.overDate = cell.day;
        }
        else if (this.chooseCounts === 2) {
            cell.day.isAfter(this.beginDate) ? this.overDate = cell.day : this.beginDate = cell.day;
        }
      }
    },
    completeDate: function () {
      if(this.rangeds!=-1){
         let dates = (this.overDate - this.beginDate)/(24*3600*1000) + 1;
         if(dates > this.rangeds){
           alert('日期范围超过'+this.rangeds+'天');
           return false;
         }
      }
      this.startDate = this.beginDate;
      this.endDate = this.overDate;

      this.$emit(this.emitname,{startDate:this.startDate.Format(),endDate:this.endDate.Format()});
      this.hideSelectWin();
    },
    cancelDate: function () {
      this.beginDate = this.startDate;
      this.overDate = this.endDate;

      this.hideSelectWin();
    },
    changelRelDate: function (flag,isreturn){
      let range = {};
      switch (flag){
        case 'd0':
          range = DateUtil.today();
          break;
        case '-d1':
          range = DateUtil.yesterday();
          break;
        case '-d7':
          range = DateUtil.lastDays(-7,this.maxFlag);
          break;
        case '-d14':
          range = DateUtil.lastDays(-14,this.maxFlag);
          break;
        case '-d30':
          range = DateUtil.lastDays(-30,this.maxFlag);
          break;
        case '-w1':
          range = DateUtil.lastWeekDays(-1,this.maxFlag);
          break;
        case 'w0':
          range = DateUtil.lastWeekDays(0,this.maxFlag);
          break;
        case '-m1':
          range = DateUtil.lastMonthDays(-1,this.maxFlag);
          break;
        case 'm0':
          range = DateUtil.lastMonthDays(0,this.maxFlag);
          break;
        case '-q1':
          range = DateUtil.lastQuarterDays(-1,this.maxFlag);
          break;
        case 'q0':
          range = DateUtil.lastQuarterDays(0,this.maxFlag);
          break;
        case '-y1':
          range = DateUtil.lastYearDays(-1,this.maxFlag);
          break;
        case 'y0':
          range = DateUtil.lastYearDays(0,this.maxFlag);
          break;
        default:
          break;
      }

      if(isreturn){
        return range;
      }

      let {startDate,endDate} = range;
      this.beginDate = this.startDate = startDate;
      this.endDate = this.overDate = endDate;
      this.completeDate();
    }
  }
}
</script>

<style lang="scss" scoped>

$bordercolor:#e1e3e4;
$activecolor:#8f9afe;
$thbgcolor:#fff;
$thbordercolor:#e1e3e4;
$hovercolor:#7381ff;

.dateBorder{border:1px solid $bordercolor;}
.dateBox{
  width:180px;
  @extend .dateBorder;
  cursor: pointer;
  position: relative;
  line-height: 26px;
  padding-left: 10px;
  border-radius: 3px;
  display: inline-block;
  &>span{
    color:#999;
  }
  &.active{
    border-color:$hovercolor;
  }

  .dateWrap{
    @extend .dateBorder;
    background-color: #fff;
    border-radius: 3px;
    padding: 20px;
    height: 367px;
    position: absolute;
    left:0px;
    top:100%;
    z-index: 1;
    margin-top: 2px;
    font-size: 12px;
    display: flex;
    justify-content: space-between;
    box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.15);

    &.single{
      height: 320px;
      .tableWrap .date-single:first-child{
        margin-right: 0px;
      }
    }
    &.toright{
      left:inherit;
      right:0px;
    }
    .tableWrap{
      flex-grow: 1;
      display: flex;
      flex-direction:column;
      .date-info{
        display: flex;
      }
      .date-single{
        background: #fff;
        @extend .dateBorder;
        border-radius: 3px;
        padding-bottom: 10px;
        box-sizing: border-box;
        height: 320px;

        &:first-child{
          margin-right: 20px;
        }
      }
      .date-title{
        height: 34px;
        line-height: 34px;
        display: flex;
        justify-content: space-between;

        .date-pre{
          margin-left: 10px;
        }
        .date-next{
          margin-right: 10px;
        }
      }
      .date-table{
        border-collapse: collapse;
        border-spacing: 0;
        th,td{
          padding:0px;
          margin: 0px;
          border:none;
        }
        th{
          background: $thbgcolor;
          border-bottom: 1px solid $thbordercolor;
          border-top: 1px solid $thbordercolor;
          height: 26px;
          line-height: 26px;
          text-align: center;
          font-weight: normal;
        }
        td > a{
          height: 26px;
          line-height: 26px;
          text-align: center;
          width: 26px;
          display: inline-block;
          text-decoration: none;
          color: #333;
          cursor: pointer;
          margin: 4px 4px 0;
          border: 1px solid transparent;
          border-radius: 13px;

          &.start_end{
            color: #fff;
            background-color: $activecolor;
          }
          &.choose{
            color: $activecolor;
            border-color: $activecolor;
          }
          &.disabled{
            color:#999;
          }
          &.other-month{
            display: none;
          }
        }
      }
    }
    .btnWrap{
      width: 140px;
      display: flex;
      flex-wrap: wrap;
      flex-direction: column;
      margin-right: 10px;
      height: 317px;
      .btn{
        margin-top: 13px;
      }
      .btn:first-child,.btn:nth-child(8){
        margin-top: 0px;
      }
    }
  }
  .date-footer{
    display: flex;
    justify-content: space-between;
    align-items:flex-end;
    margin-top: 20px;
    label{
      color:#111;
    }
    input{
      width:90px;
      @extend .dateBorder;
      border-radius: 3px;
      height: 28px;
      line-height: 28px;
      padding-left: 10px;
      box-sizing: border-box;
    }
    .prybtn{
      margin-right: 10px;
    }
    .footer-btn{
      display: flex;
      justify-content: space-between;
      width:120px;
    }
  }
  .btn{
   border:1px solid #d8dadf;
    background-color: #fff;
    border-radius: 3px;
    color:#999;
    width:54px;
    height: 28px;
    line-height: 28px;
    text-align: center;
    cursor: pointer;
    display: block;
    text-decoration: none;
    vertical-align: middle;
  }
  .btn:hover{
    border-color: $activecolor;
    color:$activecolor;
  }
  .btn.active,.btn.prybtn{
    color:#fff;
    background-color: $activecolor;
    border-color: $activecolor;
  }
}
</style>
