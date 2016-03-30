 var shortnessThaiMonth = [
    {monthValue:'01',monthName:'ม.ค.'},
    {monthValue:'02',monthName:'ก.พ.'},
    {monthValue:'03',monthName:'มี.ค.'},
    {monthValue:'04',monthName:'เม.ย.'},
    {monthValue:'05',monthName:'พ.ค.'},
    {monthValue:'06',monthName:'มิ.ย.'},
    {monthValue:'07',monthName:'ก.ค.'},
    {monthValue:'08',monthName:'ส.ค.'},
    {monthValue:'09',monthName:'ก.ย.'},
    {monthValue:'10',monthName:'ต.ค.'},
    {monthValue:'11',monthName:'พ.ย.'},
    {monthValue:'12',monthName:'ธ.ค.'},
];

 function GetCurrentDate(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    if(dd<10) dd='0'+dd
    if(mm<10) mm='0'+mm
    today = dd+'/'+mm+'/'+yyyy;
    return today;
};

function GetFiscalDate(){
	var today = new Date();
	var day = today.getDate();
	var month = today.getMonth()+1;
	var year = today.getFullYear();
	if(month > 10) return '0110' + year;
	else return '0110' + (year - 1);
};

function GetThaiDateByDate($filter,inputDate){
    var currentMonth = $filter('filter')(shortnessThaiMonth, { monthValue: inputDate.substring(2,4) });
    return inputDate.substring(0,2) + ' ' + currentMonth[0].monthName + ' ' + (parseInt(inputDate.substring(4,8)) + 543);
};

//change date format from such as '04.02.2016 07:48:48' to '04022016'
function TransformDateToddMMyyyyFormat(inputDate){
    if(!inputDate || inputDate.length == 0) return;
    return inputDate.substring(0,10).replace(/\./g,'');
};

function GetThaiMonthNameByMonth($filter,monthVal){
    if(!monthVal || monthVal.length == 0) return;
    var currentMonth = $filter('filter')(shortnessThaiMonth, { monthValue: monthVal });
    return currentMonth[0].monthName;
};

function GetStringNumber2Digits(n){
    return n > 9 ? "" + n: "0" + n;
};

function GetTimeByStampTime(stampTime){
    if(!stampTime || stampTime.length == 0) return;
    return stampTime.substring(11,16);
};

function ConvertQueryResultToArray(data){
    var newArr = [];
    for (var i = 0; i <= data.rows.length - 1; i++) {
        newArr.push(data.rows.item(i));
    };
    return newArr;
};

function GetCurrentTime(){
    var currentdate = new Date(); 
    var datetime = currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
    return datetime;
};

function CheckNeedToReload($rootScope,checkedURL){
    $rootScope.$on( "$stateChangeSuccess", function(event, next, current) {
        if(next.url == checkedURL){
            if(needReload){
                window.location.reload();
                needReload = false;
            }
        };
    });
};