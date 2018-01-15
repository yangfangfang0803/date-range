const DateUtil = {
  today: function () {
    let date = Date.today();
    return {
      startDate: date,
      endDate: date
    };
  },
  yesterday: function () {
    let date = Date.yesterday();
    return {
      startDate: date,
      endDate: date
    };
  },
  lastDays: function (flag,maxflag=0) {//近flag天，{maxflag：0最大为今天，-1为昨天，以此类推}
    flag = flag!=0 ? (flag+1) : flag;
    let endDate = Date.today().addDays(maxflag);
    return {
      startDate: endDate.clone().addDays(flag),
      endDate: endDate
    };
  },
  lastWeekDays: function (flag,maxflag=0){//0当周，-1上周，以此类推
    let endDate = Date.today().addDays(maxflag),
        wd = endDate.getDay();

    wd = wd === 0 ? 7 : wd;
    let startDate = endDate.clone().addDays(-wd+1);

    if(flag!=0){
      endDate = startDate.clone().addDays(-1+(flag+1)*7);
      startDate = endDate.clone().addDays(-6);
    }

    return {
      startDate: startDate,
      endDate: endDate
    };
  },
  lastMonthDays: function (flag,maxflag=0){//0当月，-1上月，以此类推
      let endDate = Date.today().addDays(maxflag),
          startDate = Date.getFirstDay(endDate);

      if(flag!=0){
        startDate = startDate.addMonths(flag);
        let days = Date.getDaysInMonth(startDate.getFullYear(), startDate.getMonth());
        endDate = startDate.clone().addDays(days-1);
      }
      return {
        startDate: startDate,
        endDate: endDate
      };
  },
  lastQuarterDays: function (flag,maxflag=0){//0当季，-1上季度，以此类推
      let endDate = Date.today().addDays(maxflag),
          quar = endDate.Format('q');

      let month = ['1','4','7','10'][quar-1],startDate = endDate.clone();
      startDate.setMonth(month-1,1);

      if(flag!=0){
          startDate = startDate.addMonths(flag*3);
          endDate = startDate.clone().addMonths(3).addDays(-1);
      }

      return {
        startDate: startDate,
        endDate: endDate
      };
  },
  lastYearDays: function (flag,maxflag=0){//0当年，-1上年，以此类推
    let endDate = Date.today().addDays(maxflag),
        startDate = endDate.clone();
    startDate.setMonth(0,1);

    if(flag!=0){
        startDate = startDate.addYears(flag);

        endDate = startDate.clone();
        endDate.setMonth(11,31);
    }

    return {
      startDate: startDate,
      endDate: endDate
    };
  }
}


export default DateUtil;
