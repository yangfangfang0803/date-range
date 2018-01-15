import Vue from 'vue'

//params
export const fmtdate = Vue.filter('fmtdate', function (value,params='yyyy-MM-dd') {
  if (!value) return ''
  if(typeof value !='object'){
    value = new Date(value);
  }
  return value.Format(params);
})
