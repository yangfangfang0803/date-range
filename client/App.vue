<template>
  <div class="mainapp white">
    <p>
      多日期选择：<DateSelect  @rangeDate="changeRangeDate" :initTime="initRangeDate"></DateSelect>
      当前日期:{{this.rangeDate.startDate | fmtdate}} -- {{this.rangeDate.endDate | fmtdate}}
    </p>
    <p>
      单日期选择：<DateSelect  @rangeDate="changeSingleDate" :initTime="initSingleDate" :single="true"></DateSelect>
      当前日期:{{this.singleDate | fmtdate}}
    </p>
  </div>
</template>


<script>

  import DateSelect from '@/components/common/DateSelect'
  import DateUtil from '@/util/DateUtil'
	export default {
      components:{DateSelect},
      data: function(){
        let initRdate = DateUtil.lastDays(-6),initSdata = DateUtil.lastDays(0);
        return {
          initRangeDate:initRdate,
          rangeDate:initRdate,
          initSingleDate:initSdata,
          singleDate:initSdata.startDate
        };
      },
      methods: {
        changeRangeDate: function(msg){
          this.rangeDate = msg;
        },
        changeSingleDate: function(msg){
          this.singleDate = msg.startDate;
        }
      }
	}
</script>

<style scoped>
  p{
    margin:20px;
  }
</style>
