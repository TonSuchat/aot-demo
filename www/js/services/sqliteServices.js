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

	this.BaseGetLatestTS = function(tablename,orderBySubStr){
		var sql = '';
		if(orderBySubStr)
			sql = "SELECT ts FROM " + tablename + " ORDER BY CAST(SUBSTR(ts,5,4) AS INT) DESC, CAST(SUBSTR(ts,3,2) AS INT) DESC, CAST(SUBSTR(ts,1,2) AS INT) DESC, ts DESC LIMIT 1";
		else 
			sql = "SELECT ts FROM " + tablename + " ORDER BY ts DESC LIMIT 1";
		return this.Execute(sql).then(function(response){
			return (response.rows.length > 0) ? response.rows[0] : null;
		},function(error){});
	};

	this.InitailTables = function(){
		//**Test-Sync-Code
		this.CreateTestSyncTable();
		//**Test-Sync-Code
		this.CreateUserProfileTable();
		this.CreateMedicalTable();
		this.CreateTuitionTable();
		this.CreateRoyalTable();
		this.CreateTimeAttendanceTable();
		this.CreateLeaveTable();
	};

	//**Test-Sync-Code
	this.CreateTestSyncTable = function(){
		$cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS testsync (clientid integer primary key AUTOINCREMENT, ID int, field1 text, field2 text, field3 text, TimeStamp text,deleted boolean,dirty boolean,ts datetime) ");
	}
	//**Test-Sync-Code

	this.CreateUserProfileTable = function(){
		$cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS userprofile (clientid integer primary key AUTOINCREMENT, UserID text, PrefixName text, Firstname text, Lastname text, Nickname text, Position text, Section text, Department text, CitizenID text, PicturePath text,PictureThumb text, posi_name_gover text, orga_gover text, changeDate text, OfficeTel text, OfficeFax text, MobilePhone text, eMailAddress text, Line text, Facebook text, deleted boolean, dirty boolean, ts datetime)");
	};
	this.CreateMedicalTable = function(){
		$cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS medical(clientid integer primary key AUTOINCREMENT, Id int,EmpID text, HospType text, HospName text, PatientType text, Family text, PatientName text, Disease text, Total int, DocDate text, PaidDate text, BankName text, deleted boolean,dirty boolean,ts datetime)");
	};
	this.CreateTuitionTable = function(){
		$cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS tuition(clientid integer primary key AUTOINCREMENT, Id int,Empl_Code text, Paid_Date text, Total_Amnt int, Vat_Amnt int, Grand_Total int, BankName text, deleted boolean,dirty boolean,ts datetime)");
	};
	this.CreateRoyalTable = function(){
		$cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS royal(clientid integer primary key AUTOINCREMENT, Id int,Empl_Code text, Roya_Code text, Roya_Name int, Roya_Date text, deleted boolean,dirty boolean,ts datetime)");
	};
	this.CreateTimeAttendanceTable = function(){
		$cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS timeattendance(clientid integer primary key AUTOINCREMENT, Id int, SequenceID text, EmpID text, StampTime datetime, MachineID text, StampResult boolean, Location text, Airport text, stampdate text, stamptimeonly text, deleted boolean,dirty boolean,ts datetime)");
	};
	this.CreateLeaveTable = function(){
		$cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS leave(clientid integer primary key AUTOINCREMENT, Id int, Empl_Code text, Empl_Name text, Leave_Code text, Leave_Day text, Leave_From text, Leave_To text, Leave_Date text, Updt_Date text, Tran_Seqe text, Leave_Timecode text, deleted boolean,dirty boolean,ts datetime)");
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
		return SQLiteService.Execute("SELECT SUM(Grand_Total) AS Grand_Total FROM tuition").then(function(response){return response;},function(error){return error;});
	};

	this.DeleteAllTuition = function(){
		return SQLiteService.Execute("DELETE FROM tuition").then(function(response){return response;},function(error){return error;});		
	};

	this.GetDistinctPaidDate = function(){
		return SQLiteService.Execute("SELECT DISTINCT Paid_Date FROM tuition ORDER BY CAST(SUBSTR(Paid_Date,5,4) AS INT) DESC, CAST(SUBSTR(Paid_Date,3,2) AS INT) DESC, CAST(SUBSTR(Paid_Date,1,2) AS INT) DESC").then(function(response){return response;},function(error){return error;});
	};

	this.GetLatestTS = function(){
		return SQLiteService.BaseGetLatestTS('tuition',true).then(function(response){return response;},function(error){return error;});
	};

	this.SaveTuitions = function(data){
		var sql = "INSERT INTO tuition (Id, Empl_Code, Paid_Date, Total_Amnt, Vat_Amnt, Grand_Total, BankName, deleted, dirty, ts) VALUES ";
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
		return SQLiteService.Execute("SELECT * FROM tuition ORDER BY Paid_Date").then(function(response){return response;},function(error){return error;});
	};
})
.service('RoyalSQLite', function(SQLiteService){
	this.DeleteAllRoyal = function(){
		return SQLiteService.Execute("DELETE FROM royal").then(function(response){return response;},function(error){return error;});		
	};

	this.GetRoyals = function(){
		return SQLiteService.Execute("SELECT * FROM royal ORDER BY Roya_Date DESC").then(function(response){return response;},function(error){return error;});
	};

	this.GetLatestTS = function(){
		return SQLiteService.BaseGetLatestTS('royal',true).then(function(response){return response;},function(error){return error;});
	};

	this.SaveRoyals = function(data){
		var sql = "INSERT INTO royal (Id, Empl_Code, Roya_Code, Roya_Name, Roya_Date, deleted, dirty, ts) VALUES ";
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
		var sql = "INSERT INTO timeattendance (Id, SequenceID, EmpID, StampTime, MachineID, StampResult, Location, Airport, stampdate, stamptimeonly, deleted, dirty, ts) VALUES ";
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
		return SQLiteService.Execute("SELECT DISTINCT stampdate FROM timeattendance WHERE REPLACE(SUBSTR(StampTime,3,8),'.','')  = '" + date + "'  ORDER BY StampTime DESC").then(function(response){return response;},function(error){return error;});
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
		return SQLiteService.Execute("SELECT * FROM leave ORDER BY CAST(SUBSTR(Leave_From,5,4) AS INT) DESC, CAST(SUBSTR(Leave_From,3,2) AS INT) DESC, CAST(SUBSTR(Leave_From,1,2) AS INT) DESC ").then(function(response){return response;},function(error){return error;});
	};

	this.SaveLeaves = function(data){
		var sql = "INSERT INTO leave (Id, Empl_Code, Empl_Name, Leave_Code, Leave_Day, Leave_From, Leave_To, Leave_Date, Updt_Date, Tran_Seqe, Leave_Timecode, deleted, dirty, ts) VALUES ";
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

//***Test-Sync-Code
.service('TestSyncSQLite',function(SQLiteService){
	this.GetLatestTS = function(){
		return SQLiteService.BaseGetLatestTS('testsync',true).then(function(response){return response;},function(error){return error;});
	};

	this.DeleteAll = function(){
		return SQLiteService.Execute("DELETE FROM testsync").then(function(response){return response;},function(error){return error;});		
	};

	this.Add = function(data,createFromClient){
		var sql = "INSERT INTO testsync (ID, field1, field2, field3, TimeStamp, deleted, dirty, ts) VALUES ";
		var param = []; 
		var rowArgs = [];
		data.forEach(function(item){
			rowArgs.push("(?,?,?,?,?,?,?,?)");
			param.push(item.ID);
			param.push(item.field1);
			param.push(item.field2);
			param.push(item.field3);
			param.push(item.TimeStamp);
			param.push(false);
			if(createFromClient) param.push(true); 
			else param.push(false);
			if(createFromClient) param.push(null); 
			else param.push(item.TimeStamp);
		});
		sql += rowArgs.join(', ');
		return SQLiteService.Execute(sql,param).then(function(response){return response;},function(error){console.log(error); return error;});
	};

	this.CountById = function(id){
		return SQLiteService.Execute("SELECT COUNT(*) AS countTotal FROM testsync WHERE id = " + id + " ").then(function(response){return response;},function(error){return error;});		
	};

	this.CountIsNotDirtyById = function(id){
		return SQLiteService.Execute("SELECT COUNT(*) AS countTotal FROM testsync WHERE id = '" + id + "' AND dirty = 'false'").then(function(response){return response;},function(error){return error;});			
	};
	
	this.Update = function(data,isDeleted,isDirty,whereFieldName,whereValue){
		var sql = "UPDATE testsync SET ID = ?, field1 = ?, field2 = ?, field3 = ?,TimeStamp = ?, deleted = ?,dirty = ?,ts = ? WHERE " + whereFieldName + " = " + whereValue;
		var param = [data.ID,data.field1,data.field2,data.field3,data.TimeStamp,isDeleted,isDirty,data.TimeStamp];
		// if(whereFieldName == 'clientid')
		// 	param = [data.id,data.field1,data.field2,data.field3,data.timestamp,isDeleted,isDirty,data.timestamp];
		// else
		// 	param = [data.ID,data.field1,data.field2,data.field3,data.TimeStamp,isDeleted,isDirty,data.TimeStamp];
		return SQLiteService.Execute(sql,param).then(function(response){return response;},function(error){return error;});			
	};

	this.GetDataByTSIsNull = function(){
		return SQLiteService.Execute("SELECT * FROM testsync WHERE ts is null ").then(function(response){return response;},function(error){return error;});			
	};

	this.GetDataIsDirty = function(){
		return SQLiteService.Execute("SELECT * FROM testsync WHERE dirty = 'true' ").then(function(response){return response;},function(error){return error;});				
	};

	this.DeleteDataIsFlagDeleted = function(){
		return SQLiteService.Execute("DELETE FROM testsync WHERE deleted = 'true' ").then(function(response){return response;},function(error){return error;});				
	};

	this.GetAll = function(){
		return SQLiteService.Execute("SELECT * FROM testsync").then(function(response){return response;},function(error){return error;});
	};

	this.GetById = function(clientid){
		return SQLiteService.Execute("SELECT * FROM testsync WHERE clientid = " + clientid).then(function(response){return response;},function(error){return error;});	
	}

	this.DeleteById = function(clientid){
		return SQLiteService.Execute("DELETE FROM testsync WHERE clientid = " + clientid).then(function(response){return response;},function(error){return error;});
	}
})
//***Test-Sync-Code