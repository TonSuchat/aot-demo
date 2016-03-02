var db;

angular.module('starter')
.service('SQLiteService',function($cordovaSQLite,$q){

	this.OpenDB = function(){
		if (window.cordova) db = $cordovaSQLite.openDB({ name: "AOTMobileDB.db" }); //device
        else db = window.openDatabase("AOTMobileDB.db", '1', 'my', 1024 * 1024 * 100); // browser
	};

	//data must be array eg. '[aa,bb,123]'
	this.Execute = function(sql,data){
		return $q(function(resolve,reject){
			$cordovaSQLite.execute(db, sql, data).then(
				function(response){resolve(response);},
				function(error){reject(error);});
		});
	};

	// this.ExecuteDataArray = function(sql,data){
	// 	return $q(function(resolve,reject){
	// 		$cordovaSQLite.execute(db, sql, [data]).then(
	// 			function(response){resolve(response);},
	// 			function(error){reject(error);});
	// 	});
	// }

	this.BaseGetLatestTS = function(tablename,orderBySubStr){
		var sql = '';
		if(orderBySubStr)
			sql = "SELECT ts FROM " + tablename + " ORDER BY CAST(SUBSTR(ts,5,4) AS INT) DESC, CAST(SUBSTR(ts,3,2) AS INT) DESC, CAST(SUBSTR(ts,1,2) AS INT) DESC LIMIT 1";
		else 
			sql = "SELECT ts FROM " + tablename + " ORDER BY ts DESC LIMIT 1";
		return this.Execute(sql).then(function(response){
			return (response.rows.length > 0) ? response.rows[0] : null;
		},function(error){});
	};

	this.InitailTables = function(){
		this.CreateUserProfileTable();
		this.CreateMedicalTable();
		this.CreateTuitionTable();
		this.CreateRoyalTable();
		this.CreateTimeAttendanceTable();
		this.CreateLeaveTable();
	};
	this.CreateUserProfileTable = function(){
		$cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS userprofile (userid text, prefixname text, firstname text, lastname text, nickname text, position text, section text, department text, citizenid text, picturepath text,picturethumb text, posi_name_gover text, orga_gover text, changedate text, officetel text, officefax text, mobilephone text, emailaddress text, line text, facebook text,deleted boolean,dirty boolean,ts datetime)");
	};
	this.CreateMedicalTable = function(){
		$cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS medical(id int,empid text, hosptype text, hospname text, patienttype text, family text, patientname text, disease text, total int, docdate text, paiddate text, bankname text, deleted boolean,dirty boolean,ts datetime)");
	};
	this.CreateTuitionTable = function(){
		$cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS tuition(id int,empid text, paiddate text, total int, vatamnt int, grandtotal int, bankname text, deleted boolean,dirty boolean,ts datetime)");
	};
	this.CreateRoyalTable = function(){
		$cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS royal(id int,empid text, royalcode text, royalname int, royaldate text, deleted boolean,dirty boolean,ts datetime)");
	};
	this.CreateTimeAttendanceTable = function(){
		$cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS timeattendance(id int, sequenceid text, empid text, stamptime datetime, machineid text, stampresult boolean, location text, airport text, stampdate text, stamptimeonly text, deleted boolean,dirty boolean,ts datetime)");
	};
	this.CreateLeaveTable = function(){
		$cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS leave(id int, empid text, empname text, leavecode text, leaveday text, leavefrom text, leaveto text, leavedate text, updatedate text, transseq text, leavetimecode text, deleted boolean,dirty boolean,ts datetime)");
	};

	this.DeleteAllTables = function(){
		$cordovaSQLite.execute(db, "DELETE FROM userprofile");
		$cordovaSQLite.execute(db, "DELETE FROM medical");
		$cordovaSQLite.execute(db, "DELETE FROM tuition");
		$cordovaSQLite.execute(db, "DELETE FROM royal");
		$cordovaSQLite.execute(db, "DELETE FROM timeattendance");
		$cordovaSQLite.execute(db, "DELETE FROM leave");
	}

})
.service('UserProfileSQLite', function(SQLiteService){

	this.SaveUserProfile = function(data){
		//delete previous data first
		var sql;
		sql = "DELETE FROM userprofile"
		SQLiteService.Execute(sql).then(
			function(){
				//insert new data
				sql = "INSERT INTO userprofile (userid, prefixname, firstname, lastname, nickname, position, section, department, citizenid, picturepath, picturethumb, posi_name_gover, orga_gover, changedate, officetel, officefax, mobilephone, emailaddress, line, facebook, deleted, dirty, ts) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
				var param = [data.UserID,data.PrefixName,data.Firstname,data.Lastname,data.Nickname,data.Position,data.Section,data.Department,data.CitizenID,data.PicturePath,data.PictureThumb,data.posi_name_gover,data.orga_gover,data.changeDate,data.ContactList[0].OfficeTel,data.ContactList[0].OfficeFax,data.ContactList[0].MobilePhone,data.ContactList[0].eMailAddress,data.ContactList[0].Line,data.ContactList[0].Facebook,false,false,data.changeDate];
				SQLiteService.Execute(sql,param);
			},
			function(error){})
	};

	this.GetLatestTS = function(){
		return SQLiteService.BaseGetLatestTS('userprofile',false).then(function(response){return response;},function(error){return error;});
	};
})
.service('MedicalSQLite', function(SQLiteService){

	this.GetLatestTS = function(){
		return SQLiteService.BaseGetLatestTS('medical',true).then(function(response){return response;},function(error){return error;});
	};

	this.SaveMedicals = function(data){
		var sql = "INSERT INTO medical (id, empid, hosptype, hospname, patienttype, family, patientname, disease, total, docdate, paiddate, bankname, deleted, dirty, ts) VALUES ";
		var param = []; 
		var rowArgs = [];
		data.forEach(function(item){
			rowArgs.push("(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
			param.push(item.Id);
			param.push(item.EmpID);
			param.push(item.HospType);
			param.push(item.HospName);
			param.push(item.PatientType);
			param.push(item.Family);
			param.push(item.PatientName);
			param.push(item.Disease);
			param.push(item.Total);
			param.push(item.DocDate);
			param.push(item.PaidDate);
			param.push(item.BankName);
			param.push(false);
			param.push(false);
			param.push(item.PaidDate);
		});
		sql += rowArgs.join(', ');
		return SQLiteService.Execute(sql,param).then(function(response){return response;},function(error){console.log(error); return error;});
	};

	this.GetSumMedicalTotal = function(){
		return SQLiteService.Execute("SELECT SUM(total) AS total FROM medical").then(function(response){return response;},function(error){return error;});
	};

	this.GetMedicals = function(){
		return SQLiteService.Execute("SELECT * FROM medical ORDER BY paiddate").then(function(response){return response;},function(error){return error;});
	};

	this.GetDistinctPaidDate = function(){
		return SQLiteService.Execute("SELECT DISTINCT paiddate FROM medical ORDER BY CAST(SUBSTR(paiddate,5,4) AS INT) DESC, CAST(SUBSTR(paiddate,3,2) AS INT) DESC, CAST(SUBSTR(paiddate,1,2) AS INT) DESC").then(function(response){return response;},function(error){return error;});
	};

	this.DeleteAllMedical = function(){
		return SQLiteService.Execute("DELETE FROM medical").then(function(response){return response;},function(error){return error;});	
	};
})
.service('TuitionSQLite', function(SQLiteService){
	this.GetSumTuitionGrandTotal = function(){
		return SQLiteService.Execute("SELECT SUM(grandtotal) AS grandtotal FROM tuition").then(function(response){return response;},function(error){return error;});
	};

	this.DeleteAllTuition = function(){
		return SQLiteService.Execute("DELETE FROM tuition").then(function(response){return response;},function(error){return error;});		
	};

	this.GetDistinctPaidDate = function(){
		return SQLiteService.Execute("SELECT DISTINCT paiddate FROM tuition ORDER BY CAST(SUBSTR(paiddate,5,4) AS INT) DESC, CAST(SUBSTR(paiddate,3,2) AS INT) DESC, CAST(SUBSTR(paiddate,1,2) AS INT) DESC").then(function(response){return response;},function(error){return error;});
	};

	this.GetLatestTS = function(){
		return SQLiteService.BaseGetLatestTS('tuition',true).then(function(response){return response;},function(error){return error;});
	};

	this.SaveTuitions = function(data){
		var sql = "INSERT INTO tuition (id, empid, paiddate, total, vatamnt, grandtotal, bankname, deleted, dirty, ts) VALUES ";
		var param = []; 
		var rowArgs = [];
		data.forEach(function(item){
			rowArgs.push("(?,?,?,?,?,?,?,?,?,?)");
			param.push(item.Id);
			param.push(item.Empl_Code);
			param.push(item.Paid_Date);
			param.push(item.Total_Amnt);
			param.push(item.Vat_Amnt);
			param.push(item.Grand_Total);
			param.push(item.BankName);
			param.push(false);
			param.push(false);
			param.push(item.Paid_Date);
		});
		sql += rowArgs.join(', ');
		return SQLiteService.Execute(sql,param).then(function(response){return response;},function(error){console.log(error); return error;});
	};

	this.GetTuitions = function(){
		return SQLiteService.Execute("SELECT * FROM tuition ORDER BY paiddate").then(function(response){return response;},function(error){return error;});
	};
})
.service('RoyalSQLite', function(SQLiteService){
	this.DeleteAllRoyal = function(){
		return SQLiteService.Execute("DELETE FROM royal").then(function(response){return response;},function(error){return error;});		
	};

	this.GetRoyals = function(){
		return SQLiteService.Execute("SELECT * FROM royal ORDER BY royaldate DESC").then(function(response){return response;},function(error){return error;});
	};

	this.GetLatestTS = function(){
		return SQLiteService.BaseGetLatestTS('royal',true).then(function(response){return response;},function(error){return error;});
	};

	this.SaveRoyals = function(data){
		var sql = "INSERT INTO royal (id, empid, royalcode, royalname, royaldate, deleted, dirty, ts) VALUES ";
		var param = []; 
		var rowArgs = [];
		data.forEach(function(item){
			rowArgs.push("(?,?,?,?,?,?,?,?)");
			param.push(item.Id);
			param.push(item.Empl_Code);
			param.push(item.Roya_Code);
			param.push(item.Roya_Name);
			param.push(item.Roya_Date);
			param.push(false);
			param.push(false);
			param.push(item.Roya_Date);
		});
		sql += rowArgs.join(', ');
		return SQLiteService.Execute(sql,param).then(function(response){return response;},function(error){console.log(error); return error;});
	};
})
.service('TimeAttendanceSQLite', function(SQLiteService){
	this.DeleteAllTimeAttendance = function(){
		return SQLiteService.Execute("DELETE FROM timeattendance").then(function(response){return response;},function(error){return error;});		
	};

	this.GetTimeAttendances = function(){
		return SQLiteService.Execute("SELECT * FROM timeattendance ORDER BY stamptime DESC").then(function(response){return response;},function(error){return error;});
	};

	this.GetLatestTS = function(){
		return SQLiteService.BaseGetLatestTS('timeattendance',false).then(function(response){return response;},function(error){return error;});
	};

	this.SaveTimeAttendances = function(data){
		var sql = "INSERT INTO timeattendance (id, sequenceid, empid, stamptime, machineid, stampresult, location, airport, stampdate, stamptimeonly, deleted, dirty, ts) VALUES ";
		var param = []; 
		var rowArgs = [];
		data.forEach(function(item){
			rowArgs.push("(?,?,?,?,?,?,?,?,?,?,?,?,?)");
			param.push(item.Id);
			param.push(item.SequenceID);
			param.push(item.EmpID);
			param.push(item.StampTime);
			param.push(item.MachineID);
			param.push(item.StampResult);
			param.push(item.Location);
			param.push(item.Airport);
			param.push(TransformDateToddMMyyyyFormat(item.StampTime));
			param.push(GetTimeByStampTime(item.StampTime));
			param.push(false);
			param.push(false);
			param.push(item.StampTime);
		});
		sql += rowArgs.join(', ');
		return SQLiteService.Execute(sql,param).then(function(response){return response;},function(error){console.log(error); return error;});
	};

	this.GetDistinctStampDateByFromDateAndToDate = function(date){
		return SQLiteService.Execute("SELECT DISTINCT stampdate FROM timeattendance WHERE REPLACE(SUBSTR(stamptime,3,8),'.','')  = '" + date + "'  ORDER BY stamptime DESC").then(function(response){return response;},function(error){return error;});
	};
})
.service('LeaveSQLite',function(SQLiteService){
	this.GetLatestTS = function(){
		return SQLiteService.BaseGetLatestTS('leave',true).then(function(response){return response;},function(error){return error;});
	};

	this.DeleteAllLeave = function(){
		return SQLiteService.Execute("DELETE FROM leave").then(function(response){return response;},function(error){return error;});		
	};

	this.GetLeaves = function(){
		return SQLiteService.Execute("SELECT * FROM leave ORDER BY CAST(SUBSTR(leavefrom,5,4) AS INT) DESC, CAST(SUBSTR(leavefrom,3,2) AS INT) DESC, CAST(SUBSTR(leavefrom,1,2) AS INT) DESC ").then(function(response){return response;},function(error){return error;});
	};

	this.SaveLeaves = function(data){
		var sql = "INSERT INTO leave (id, empid, empname, leavecode, leaveday, leavefrom, leaveto, leavedate, updatedate, transseq, leavetimecode, deleted, dirty, ts) VALUES ";
		var param = []; 
		var rowArgs = [];
		data.forEach(function(item){
			rowArgs.push("(?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
			param.push(item.Id);
			param.push(item.Empl_Code);
			param.push(item.Empl_Name);
			param.push(item.Leave_Code);
			param.push(item.Leave_Day);
			param.push(item.Leave_From);
			param.push(item.Leave_To);
			param.push(item.Leave_Date);
			param.push(item.Updt_Date);
			param.push(item.Tran_Seqe);
			param.push(item.Leave_Timecode);
			param.push(false);
			param.push(false);
			param.push(item.Leave_Date);
		});
		sql += rowArgs.join(', ');
		return SQLiteService.Execute(sql,param).then(function(response){return response;},function(error){console.log(error); return error;});
	};
})