var db;
var tableNames = ['userprofile','medical','tuition','royal','timeattendance','leave','circular','news'];

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

	//****share-method****
	this.BaseGetLatestTS = function(tablename){
		var sql = "SELECT TS FROM " + tablename + " ORDER BY TS DESC LIMIT 1";
		// if(orderBySubStr)
		// 	sql = "SELECT ts FROM " + tablename + " ORDER BY CAST(SUBSTR(ts,5,4) AS INT) DESC, CAST(SUBSTR(ts,3,2) AS INT) DESC, CAST(SUBSTR(ts,1,2) AS INT) DESC, ts DESC LIMIT 1";
		// else 
		// 	sql = "SELECT ts FROM " + tablename + " ORDER BY ts DESC LIMIT 1";
		return this.Execute(sql).then(function(response){
			return (response.rows.length > 0) ? response.rows.item(0) : null;
		},function(error){});
	};

	this.GetDataByTSIsNull = function(tablename){
		return this.Execute("SELECT * FROM " + tablename + " WHERE (TS is null  OR TS = '')").then(function(response){return response;},function(error){return error;});			
	};

	this.GetDataIsDirty = function(tablename){
		return this.Execute("SELECT * FROM " + tablename + " WHERE dirty = 'true' ").then(function(response){return response;},function(error){return error;});				
	};

	this.CountByServerId = function(id,tablename){
		return this.Execute("SELECT COUNT(*) AS countTotal FROM " + tablename + " WHERE Id = " + id).then(function(response){return response;},function(error){return error;});		
	};

	this.CountIsNotDirtyById = function(id,tablename){
		return this.Execute("SELECT COUNT(*) AS countTotal FROM " + tablename + " WHERE Id = " + id + " AND dirty = 'false'").then(function(response){return response;},function(error){return error;});			
	};

	this.DeleteAll = function(tablename){
		return this.Execute("DELETE FROM " + tablename).then(function(response){return response;},function(error){return error;});	
	};

	this.DeleteByServerId = function(tablename,id){
		return this.Execute("DELETE FROM " + tablename + " WHERE Id = " + id).then(function(response){return response;},function(error){return error;});
	};

	this.DeleteDataIsFlagDeleted = function(tablename){
		return this.Execute("DELETE FROM " + tablename + " WHERE DL = 'true' AND dirty = 'false' ").then(function(response){return response;},function(error){return error;});				
	};
	//****share-method****

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
		this.CreateCircularTable();
		this.CreateNewsTable();
	};

	//**Test-Sync-Code
	this.CreateTestSyncTable = function(){
		//$cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS testsync (clientid integer primary key AUTOINCREMENT, Id int, field1 text, field2 text, field3 text, TimeStamp text,deleted boolean,dirty boolean,ts datetime) ");
		$cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS testsync (clientid integer primary key AUTOINCREMENT, Id int, field1 text, field2 text, field3 text, TS datetime, DL boolean, dirty boolean) ");
	}
	//**Test-Sync-Code

	this.CreateUserProfileTable = function(){
		$cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS userprofile (clientid integer primary key AUTOINCREMENT, UserID text, PrefixName text, Firstname text, Lastname text, Nickname text, Position text, Section text, Department text, CitizenID text, PicturePath text,PictureThumb text, posi_name_gover text, orga_gover text, changeDate text, OfficeTel text, OfficeFax text, MobilePhone text, eMailAddress text, Line text, Facebook text, DL boolean, dirty boolean, TS datetime)");
	};
	this.CreateMedicalTable = function(){
		$cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS medical(clientid integer primary key AUTOINCREMENT, Id int,EmpID text, HospType text, HospName text, PatientType text, Family text, PatientName text, Disease text, Total int, DocDate text, PaidDate text, BankName text, DL boolean,dirty boolean,TS datetime)");
	};
	this.CreateTuitionTable = function(){
		$cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS tuition(clientid integer primary key AUTOINCREMENT, Id int,Empl_Code text, Paid_Date text, Total_Amnt int, Vat_Amnt int, Grand_Total int, BankName text, DL boolean,dirty boolean,TS datetime)");
	};
	this.CreateRoyalTable = function(){
		$cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS royal(clientid integer primary key AUTOINCREMENT, Id int,Empl_Code text, Roya_Code text, Roya_Name int, Roya_Date text, DL boolean,dirty boolean,TS datetime)");
	};
	this.CreateTimeAttendanceTable = function(){
		$cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS timeattendance(clientid integer primary key AUTOINCREMENT, Id int, SequenceID text, EmpID text, StampTime datetime, MachineID text, StampResult boolean, Location text, Airport text, stampdate text, stamptimeonly text, DL boolean,dirty boolean,TS datetime)");
	};
	this.CreateLeaveTable = function(){
		$cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS leave(clientid integer primary key AUTOINCREMENT, Id int, Empl_Code text, Empl_Name text, Leave_Code text, Leave_Day text, Leave_From text, Leave_To text, Leave_Date text, Updt_Date text, Tran_Seqe text, Leave_Timecode text, DL boolean,dirty boolean,TS datetime)");
	};
	this.CreateCircularTable = function(){
		$cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS circular(clientid integer primary key AUTOINCREMENT, Id int, DocID text, DocDate text, Link text, Description text, DocNumber text, DL boolean,dirty boolean,TS datetime)");	
	};

	this.CreateNewsTable = function(){
		$cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS news(clientid integer primary key AUTOINCREMENT, Id int, Title text, PubDate text, FileName text, DL boolean,dirty boolean,TS datetime)");	
	};

	this.DeleteAllTables = function(){
		// $cordovaSQLite.execute(db, "DELETE FROM userprofile");
		// $cordovaSQLite.execute(db, "DELETE FROM medical");
		// $cordovaSQLite.execute(db, "DELETE FROM tuition");
		// $cordovaSQLite.execute(db, "DELETE FROM royal");
		// $cordovaSQLite.execute(db, "DELETE FROM timeattendance");
		// $cordovaSQLite.execute(db, "DELETE FROM leave");
		// $cordovaSQLite.execute(db, "DELETE FROM circular");
		return $q(function(resolve,reject){
			var totalProcess = 0;
			for (var i = 0; i <= tableNames.length - 1; i++) {
				$cordovaSQLite.execute(db, "DELETE FROM " + tableNames[i]).then(
					function(){
						totalProcess++;
						if(totalProcess == tableNames.length) resolve();
					},
					function(error){console.log(error);reject(error);});
			};
		});
	};

})
.service('UserProfileSQLite', function(SQLiteService){

	this.SaveUserProfile = function(data){
		//delete previous data first
		var sql;
		sql = "DELETE FROM userprofile"
		SQLiteService.Execute(sql).then(
			function(){
				//insert new data
				sql = "INSERT INTO userprofile (userid, prefixname, firstname, lastname, nickname, position, section, department, citizenid, picturepath, picturethumb, posi_name_gover, orga_gover, changedate, officetel, officefax, mobilephone, emailaddress, line, facebook, DL, dirty, TS) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
				console.log(sql);
				var param = [data.UserID,data.PrefixName,data.Firstname,data.Lastname,data.Nickname,data.Position,data.Section,data.Department,data.CitizenID,data.PicturePath,data.PictureThumb,data.posi_name_gover,data.orga_gover,data.changeDate,data.ContactList[0].OfficeTel,data.ContactList[0].OfficeFax,data.ContactList[0].MobilePhone,data.ContactList[0].eMailAddress,data.ContactList[0].Line,data.ContactList[0].Facebook,false,false,data.changeDate];
				SQLiteService.Execute(sql,param).then(function(){},function(error){console.log(error);});
			},
			function(error){console.log(error);})
	};

	this.GetLatestTS = function(){
		return SQLiteService.BaseGetLatestTS('userprofile',false).then(function(response){return response;},function(error){return error;});
	};

	this.GetUserProfile = function(){
		return SQLiteService.Execute('SELECT * FROM userprofile').then(function(response){return response;},function(error){return error;});	
	}
})
.service('MedicalSQLite', function(SQLiteService){
	//***Necessary-Method
	this.GetLatestTS = function(){
		return SQLiteService.BaseGetLatestTS('medical').then(function(response){return response;},function(error){return error;});
	};

	this.CountByServerId = function(serverid){
		return SQLiteService.CountByServerId(serverid,'medical').then(function(response){return response;},function(error){return error;});		
	};

	this.CountIsNotDirtyById = function(id){
		return SQLiteService.CountIsNotDirtyById(id,'medical').then(function(response){return response;},function(error){return error;});		
	};

	
	this.GetDataByTSIsNull = function(){
		return SQLiteService.GetDataByTSIsNull('medical');
	};

	this.GetDataIsDirty = function(){
		return SQLiteService.GetDataIsDirty("medical");
	};

	this.DeleteDataIsFlagDeleted = function(){
		return SQLiteService.DeleteDataIsFlagDeleted("medical");
	};

	this.Update = function(data,isDirty,clientUpdate){
		var sql;
		if(clientUpdate)
			sql = "UPDATE medical SET Id = ?,EmpID = ?, HospType = ?, HospName = ?, PatientType = ?, Family = ?, PatientName = ?, Disease = ?, Total = ?, DocDate = ?, PaidDate = ?, BankName = ?, DL = ?,dirty = ?,TS = ? WHERE clientid = " + data.clientid;	
		else
			sql = "UPDATE medical SET Id = ?,EmpID = ?, HospType = ?, HospName = ?, PatientType = ?, Family = ?, PatientName = ?, Disease = ?, Total = ?, DocDate = ?, PaidDate = ?, BankName = ?, DL = ?,dirty = ?,TS = ? WHERE Id = " + data.Id;
		var param = [data.Id,data.EmpID,data.HospType,data.HospName,data.PatientType,data.Family,data.PatientName,data.Disease,data.Total,data.DocDate,data.PaidDate,data.BankName,data.DL,isDirty,data.TS];
		return SQLiteService.Execute(sql,param).then(function(response){return response;},function(error){return error;});	
	};

	this.Add = function(data,createFromClient){
		var sql = "INSERT INTO medical (id, empid, hosptype, hospname, patienttype, family, patientname, disease, total, docdate, paiddate, bankname, DL, dirty, TS) VALUES ";
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
			param.push(item.DL);
			//dirty
			if(createFromClient) param.push(true);
			else param.push(false);
			//TS
			if(createFromClient) param.push(null);
			else param.push(item.TS);
		});
		sql += rowArgs.join(', ');
		return SQLiteService.Execute(sql,param).then(function(response){return response;},function(error){console.log(error); return error;});
	};
	//***Necessary-Method

	this.GetSumMedicalTotal = function(){
		return SQLiteService.Execute("SELECT SUM(total) AS total FROM medical").then(function(response){return response;},function(error){return error;});
	};

	this.GetMedicals = function(){
		return SQLiteService.Execute("SELECT * FROM medical ORDER BY paiddate").then(function(response){return response;},function(error){return error;});
	};

	this.GetDistinctPaidDate = function(){
		return SQLiteService.Execute("SELECT DISTINCT paiddate FROM medical ORDER BY CAST(SUBSTR(paiddate,5,4) AS INT) DESC, CAST(SUBSTR(paiddate,3,2) AS INT) DESC, CAST(SUBSTR(paiddate,1,2) AS INT) DESC").then(function(response){return response;},function(error){return error;});
	};

	this.DeleteAll = function(){
		return SQLiteService.DeleteAll("medical").then(function(response){return response;},function(error){return error;});	
	};
})
.service('TuitionSQLite', function(SQLiteService){
	//***Necessary-Method
	this.GetLatestTS = function(){
		return SQLiteService.BaseGetLatestTS('tuition').then(function(response){return response;},function(error){return error;});
	};

	this.CountByServerId = function(serverid){
		return SQLiteService.CountByServerId(serverid,'tuition').then(function(response){return response;},function(error){return error;});		
	};

	this.CountIsNotDirtyById = function(id){
		return SQLiteService.CountIsNotDirtyById(id,'tuition').then(function(response){return response;},function(error){return error;});		
	};

	this.GetDataByTSIsNull = function(){
		return SQLiteService.GetDataByTSIsNull('tuition');
	};

	this.GetDataIsDirty = function(){
		return SQLiteService.GetDataIsDirty("tuition");
	};

	this.DeleteDataIsFlagDeleted = function(){
		return SQLiteService.DeleteDataIsFlagDeleted("tuition");
	};

	this.Update = function(data,isDirty,clientUpdate){
		var sql;
		if(clientUpdate)
			sql = "UPDATE tuition SET Id = ?, Empl_Code = ?, Paid_Date = ?, Total_Amnt = ?, Vat_Amnt = ?, Grand_Total = ?, BankName = ?, DL = ?, dirty = ?, TS = ? WHERE clientid = " + data.clientid;
		else
			sql = "UPDATE tuition SET Id = ?, Empl_Code = ?, Paid_Date = ?, Total_Amnt = ?, Vat_Amnt = ?, Grand_Total = ?, BankName = ?, DL = ?, dirty = ?, TS = ? WHERE Id = " + data.Id;
		var param = [data.Id,data.Empl_Code,data.Paid_Date,data.Total_Amnt,data.Vat_Amnt,data.Grand_Total,data.BankName,data.DL,isDirty,data.TS];
		return SQLiteService.Execute(sql,param).then(function(response){return response;},function(error){return error;});	
	};

	this.Add = function(data,createFromClient){
		var sql = "INSERT INTO tuition (Id, Empl_Code, Paid_Date, Total_Amnt, Vat_Amnt, Grand_Total, BankName, DL, dirty, TS) VALUES ";
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
			param.push(item.DL);
			//dirty
			if(createFromClient) param.push(true);
			else param.push(false);
			//TS
			if(createFromClient) param.push(null);
			else param.push(item.TS);
		});
		sql += rowArgs.join(', ');
		return SQLiteService.Execute(sql,param).then(function(response){return response;},function(error){console.log(error); return error;});
	};
	//***Necessary-Method

	this.GetSumTuitionGrandTotal = function(){
		return SQLiteService.Execute("SELECT SUM(Grand_Total) AS Grand_Total FROM tuition").then(function(response){return response;},function(error){return error;});
	};

	this.DeleteAll = function(){
		return SQLiteService.Execute("DELETE FROM tuition").then(function(response){return response;},function(error){return error;});		
	};

	this.GetDistinctPaidDate = function(){
		return SQLiteService.Execute("SELECT DISTINCT Paid_Date FROM tuition ORDER BY CAST(SUBSTR(Paid_Date,5,4) AS INT) DESC, CAST(SUBSTR(Paid_Date,3,2) AS INT) DESC, CAST(SUBSTR(Paid_Date,1,2) AS INT) DESC").then(function(response){return response;},function(error){return error;});
	};

	this.GetTuitions = function(){
		return SQLiteService.Execute("SELECT * FROM tuition ORDER BY Paid_Date").then(function(response){return response;},function(error){return error;});
	};
})
.service('RoyalSQLite', function(SQLiteService){
	//***Necessary-Method
	this.GetLatestTS = function(){
		return SQLiteService.BaseGetLatestTS('royal').then(function(response){return response;},function(error){return error;});
	};

	this.CountByServerId = function(serverid){
		return SQLiteService.CountByServerId(serverid,'royal').then(function(response){return response;},function(error){return error;});		
	};

	this.CountIsNotDirtyById = function(id){
		return SQLiteService.CountIsNotDirtyById(id,'royal').then(function(response){return response;},function(error){return error;});		
	};

	this.GetDataByTSIsNull = function(){
		return SQLiteService.GetDataByTSIsNull('royal');
	};

	this.GetDataIsDirty = function(){
		return SQLiteService.GetDataIsDirty("royal");
	};

	this.DeleteDataIsFlagDeleted = function(){
		return SQLiteService.DeleteDataIsFlagDeleted("royal");
	};

	this.Update = function(data,isDirty,clientUpdate){
		var sql;
		if(clientUpdate)
			sql = "UPDATE royal SET Id = ?, Empl_Code = ?, Roya_Code = ?, Roya_Name = ?, Roya_Date = ?, DL = ?, dirty = ?, TS = ? WHERE clientid = " + data.clientid;
		else
			sql = "UPDATE royal SET Id = ?, Empl_Code = ?, Roya_Code = ?, Roya_Name = ?, Roya_Date = ?, DL = ?, dirty = ?, TS = ? WHERE Id = " + data.Id;
		var param = [data.Id,data.Empl_Code,data.Roya_Code,data.Roya_Name,data.Roya_Date,data.DL,isDirty,data.TS];
		console.log(sql);
		console.log(param);
		return SQLiteService.Execute(sql,param).then(function(response){return response;},function(error){return error;});	
	};

	this.Add = function(data,createFromClient){
		var sql = "INSERT INTO royal (Id, Empl_Code, Roya_Code, Roya_Name, Roya_Date, DL, dirty, TS) VALUES ";
		var param = []; 
		var rowArgs = [];
		data.forEach(function(item){
			rowArgs.push("(?,?,?,?,?,?,?,?)");
			param.push(item.Id);
			param.push(item.Empl_Code);
			param.push(item.Roya_Code);
			param.push(item.Roya_Name);
			param.push(item.Roya_Date);
			param.push(item.DL);
			//dirty
			if(createFromClient) param.push(true);
			else param.push(false);
			//TS
			if(createFromClient) param.push(null);
			else param.push(item.TS);
		});
		sql += rowArgs.join(', ');
		return SQLiteService.Execute(sql,param).then(function(response){return response;},function(error){console.log(error); return error;});
	};
	//***Necessary-Method

	this.DeleteAll = function(){
		return SQLiteService.Execute("DELETE FROM royal").then(function(response){return response;},function(error){return error;});		
	};

	this.GetRoyals = function(){
		return SQLiteService.Execute("SELECT * FROM royal ORDER BY Roya_Date DESC").then(function(response){return response;},function(error){return error;});
	};	
})
.service('TimeAttendanceSQLite', function(SQLiteService){
	//***Necessary-Method
	this.GetLatestTS = function(){
		return SQLiteService.BaseGetLatestTS('timeattendance').then(function(response){return response;},function(error){return error;});
	};

	this.CountByServerId = function(serverid){
		return SQLiteService.CountByServerId(serverid,'timeattendance').then(function(response){return response;},function(error){return error;});		
	};

	this.CountIsNotDirtyById = function(id){
		return SQLiteService.CountIsNotDirtyById(id,'timeattendance').then(function(response){return response;},function(error){return error;});		
	};

	this.GetDataByTSIsNull = function(){
		return SQLiteService.GetDataByTSIsNull('timeattendance');
	};

	this.GetDataIsDirty = function(){
		return SQLiteService.GetDataIsDirty("timeattendance");
	};

	this.DeleteDataIsFlagDeleted = function(){
		return SQLiteService.DeleteDataIsFlagDeleted("timeattendance");
	};

	this.Update = function(data,isDirty,clientUpdate){
		var sql;
		var param;
		if(clientUpdate)
		{
			sql = "UPDATE timeattendance SET Id = ?, SequenceID = ?, EmpID = ?, StampTime = ?, MachineID = ?, StampResult = ?, Location = ?, Airport = ?, stampdate = ?, stamptimeonly = ?, DL = ?, dirty = ?, TS = ? WHERE clientid = " + data.clientid;
			param = [data.Id,data.SequenceID,data.EmpID,data.StampTime,data.MachineID,data.StampResult,data.Location,data.Airport,null,null,data.DL,isDirty,data.TS];
		}			
		else
		{
			sql = "UPDATE timeattendance SET Id = ?, SequenceID = ?, EmpID = ?, StampTime = ?, MachineID = ?, StampResult = ?, Location = ?, Airport = ?, stampdate = ?, stamptimeonly = ?, DL = ?, dirty = ?, TS = ? WHERE Id = " + data.Id;		
			param = [data.Id,data.SequenceID,data.EmpID,data.StampTime,data.MachineID,data.StampResult,data.Location,data.Airport,TransformDateToddMMyyyyFormat(data.StampTime),GetTimeByStampTime(data.StampTime),data.DL,isDirty,data.TS];
		}
		return SQLiteService.Execute(sql,param).then(function(response){return response;},function(error){return error;});	
	};

	this.Add = function(data,createFromClient){
		var sql = "INSERT INTO timeattendance (Id, SequenceID, EmpID, StampTime, MachineID, StampResult, Location, Airport, stampdate, stamptimeonly, DL, dirty, TS) VALUES ";
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
			//stampdate
			if(createFromClient) param.push(null);
			else param.push(TransformDateToddMMyyyyFormat(item.StampTime));
			//stamptimeonly
			if(createFromClient) param.push(null);
			else param.push(GetTimeByStampTime(item.StampTime));
			//DL
			param.push(item.DL);
			//dirty
			if(createFromClient) param.push(true);
			else param.push(false);
			//TS
			if(createFromClient) param.push(null);
			else param.push(item.TS);
		});
		sql += rowArgs.join(', ');
		return SQLiteService.Execute(sql,param).then(function(response){return response;},function(error){console.log(error); return error;});
	};
	//***Necessary-Method

	this.DeleteAll = function(){
		return SQLiteService.Execute("DELETE FROM timeattendance").then(function(response){return response;},function(error){return error;});		
	};

	this.GetTimeAttendances = function(){
		return SQLiteService.Execute("SELECT * FROM timeattendance ORDER BY stamptime DESC").then(function(response){return response;},function(error){return error;});
	};

	this.GetDistinctStampDateByFromDateAndToDate = function(date){
		return SQLiteService.Execute("SELECT DISTINCT stampdate FROM timeattendance WHERE REPLACE(SUBSTR(StampTime,3,8),'.','')  = '" + date + "'  ORDER BY StampTime DESC").then(function(response){return response;},function(error){return error;});
	};
})
.service('LeaveSQLite',function(SQLiteService){
	//***Necessary-Method
	this.GetLatestTS = function(){
		return SQLiteService.BaseGetLatestTS('leave').then(function(response){return response;},function(error){return error;});
	};

	this.CountByServerId = function(serverid){
		return SQLiteService.CountByServerId(serverid,'leave').then(function(response){return response;},function(error){return error;});		
	};

	this.CountIsNotDirtyById = function(id){
		return SQLiteService.CountIsNotDirtyById(id,'leave').then(function(response){return response;},function(error){return error;});		
	};

	this.GetDataByTSIsNull = function(){
		return SQLiteService.GetDataByTSIsNull('leave');
	};

	this.GetDataIsDirty = function(){
		return SQLiteService.GetDataIsDirty("leave");
	};

	this.DeleteDataIsFlagDeleted = function(){
		return SQLiteService.DeleteDataIsFlagDeleted("leave");
	};

	this.Update = function(data,isDirty,clientUpdate){
		var sql;
		if(clientUpdate)
			sql = "UPDATE leave SET Id = ?, Empl_Code = ?, Empl_Name = ?, Leave_Code = ?, Leave_Day = ?, Leave_From = ?, Leave_To = ?, Leave_Date = ?, Updt_Date = ?, Tran_Seqe = ?, Leave_Timecode = ?, DL = ?, dirty = ?, TS = ? WHERE clientid = " + data.clientid;
		else
			sql = "UPDATE leave SET Id = ?, Empl_Code = ?, Empl_Name = ?, Leave_Code = ?, Leave_Day = ?, Leave_From = ?, Leave_To = ?, Leave_Date = ?, Updt_Date = ?, Tran_Seqe = ?, Leave_Timecode = ?, DL = ?, dirty = ?, TS = ? WHERE Id = " + data.Id;
		var param = [data.Id,data.Empl_Code,data.Empl_Name,data.Leave_Code,data.Leave_Day,data.Leave_From,data.Leave_To,data.Leave_Date,data.Updt_Date,data.Tran_Seqe,data.Leave_Timecode,data.DL,isDirty,data.TS];
		return SQLiteService.Execute(sql,param).then(function(response){return response;},function(error){return error;});	
	};

	this.Add = function(data,createFromClient){
		var sql = "INSERT INTO leave (Id, Empl_Code, Empl_Name, Leave_Code, Leave_Day, Leave_From, Leave_To, Leave_Date, Updt_Date, Tran_Seqe, Leave_Timecode, DL, dirty, TS) VALUES ";
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
			param.push(item.DL);
			//dirty
			if(createFromClient) param.push(true);
			else param.push(false);
			//TS
			if(createFromClient) param.push(null);
			else param.push(item.TS);
		});
		sql += rowArgs.join(', ');
		return SQLiteService.Execute(sql,param).then(function(response){return response;},function(error){console.log(error); return error;});
	};
	//***Necessary-Method

	this.DeleteAll = function(){
		return SQLiteService.Execute("DELETE FROM leave").then(function(response){return response;},function(error){return error;});		
	};

	this.GetLeaves = function(){
		return SQLiteService.Execute("SELECT * FROM leave ORDER BY CAST(SUBSTR(Leave_From,5,4) AS INT) DESC, CAST(SUBSTR(Leave_From,3,2) AS INT) DESC, CAST(SUBSTR(Leave_From,1,2) AS INT) DESC ").then(function(response){return response;},function(error){return error;});
	};
})
.service('CircularSQLite',function(SQLiteService){
	//***Necessary-Method
	this.GetLatestTS = function(){
		return SQLiteService.BaseGetLatestTS('circular').then(function(response){return response;},function(error){return error;});
	};

	this.CountByServerId = function(serverid){
		return SQLiteService.CountByServerId(serverid,'circular').then(function(response){return response;},function(error){return error;});		
	};

	this.CountIsNotDirtyById = function(id){
		return SQLiteService.CountIsNotDirtyById(id,'circular').then(function(response){return response;},function(error){return error;});		
	};

	this.GetDataByTSIsNull = function(){
		return SQLiteService.GetDataByTSIsNull('circular');
	};

	this.GetDataIsDirty = function(){
		return SQLiteService.GetDataIsDirty("circular");
	};

	this.DeleteDataIsFlagDeleted = function(){
		return SQLiteService.DeleteDataIsFlagDeleted("circular");
	};

	this.Update = function(data,isDirty,clientUpdate){
		var sql;
		if(clientUpdate)
			sql = "UPDATE circular SET Id = ?, DocID = ?, DocDate = ?, Link = ?, Description = ?, DocNumber = ?, DL = ?,dirty = ?,TS = ? WHERE clientid = " + data.clientid;
		else
			sql = "UPDATE circular SET Id = ?, DocID = ?, DocDate = ?, Link = ?, Description = ?, DocNumber = ?, DL = ?,dirty = ?,TS = ? WHERE Id = " + data.Id;
		var param = [data.Id,data.DocID,data.DocDate,data.Link,data.Description,data.DocNumber,data.DL,isDirty,data.TS];
		console.log(sql);
		console.log(param);
		return SQLiteService.Execute(sql,param).then(function(response){return response;},function(error){return error;});	
	};

	this.Add = function(data,createFromClient){
		var sql = "INSERT INTO circular (Id, DocID, DocDate, Link, Description, DocNumber, DL, dirty, TS) VALUES ";
		var param = []; 
		var rowArgs = [];
		data.forEach(function(item){
			rowArgs.push("(?,?,?,?,?,?,?,?,?)");
			param.push(item.Id);
			param.push(item.DocID);
			param.push(item.DocDate);
			param.push(item.Link);
			param.push(item.Description);
			param.push(item.DocNumber);
			param.push(item.DL);
			//dirty
			if(createFromClient) param.push(true);
			else param.push(false);
			//TS
			if(createFromClient) param.push(null);
			else param.push(item.TS);
		});
		sql += rowArgs.join(', ');
		return SQLiteService.Execute(sql,param).then(function(response){return response;},function(error){console.log(error); return error;});
	};
	//***Necessary-Method

	this.GetDistinctDate = function(){
		return SQLiteService.Execute("SELECT DISTINCT DocDate FROM circular ORDER BY CAST(SUBSTR(DocDate,5,4) AS INT) DESC, CAST(SUBSTR(DocDate,3,2) AS INT) DESC, CAST(SUBSTR(DocDate,1,2) AS INT) DESC").then(function(response){return response;},function(error){return error;});
	};

	this.GetAll = function(){
		return SQLiteService.Execute("SELECT * FROM circular").then(function(response){return response;},function(error){return error;});	
	};
})
.service('NewsSQLite',function(SQLiteService){
	//***Necessary-Method
	this.GetLatestTS = function(){
		return SQLiteService.BaseGetLatestTS('news').then(function(response){return response;},function(error){return error;});
	};

	this.CountByServerId = function(serverid){
		return SQLiteService.CountByServerId(serverid,'news').then(function(response){return response;},function(error){return error;});		
	};

	this.CountIsNotDirtyById = function(id){
		return SQLiteService.CountIsNotDirtyById(id,'news').then(function(response){return response;},function(error){return error;});		
	};

	this.GetDataByTSIsNull = function(){
		return SQLiteService.GetDataByTSIsNull('news');
	};

	this.GetDataIsDirty = function(){
		return SQLiteService.GetDataIsDirty("news");
	};

	this.DeleteDataIsFlagDeleted = function(){
		return SQLiteService.DeleteDataIsFlagDeleted("news");
	};

	this.Update = function(data,isDirty,clientUpdate){
		var sql;
		if(clientUpdate)
			sql = "UPDATE news SET Id = ?, Title = ?, PubDate = ?, FileName = ?, DL = ?,dirty = ?,TS = ? WHERE clientid = " + data.clientid;
		else
			sql = "UPDATE news SET Id = ?, Title = ?, PubDate = ?, FileName = ?, DL = ?,dirty = ?,TS = ? WHERE Id = " + data.Id;
		var param = [data.Id,data.Title,data.PubDate,data.FileName,data.DL,isDirty,data.TS];
		return SQLiteService.Execute(sql,param).then(function(response){return response;},function(error){return error;});	
	};

	this.Add = function(data,createFromClient){
		var sql = "INSERT INTO news (Id, Title, PubDate, FileName, DL, dirty, TS) VALUES ";
		var param = []; 
		var rowArgs = [];
		data.forEach(function(item){
			rowArgs.push("(?,?,?,?,?,?,?)");
			param.push(item.Id);
			param.push(item.Title);
			param.push(item.PubDate);
			param.push(item.FileName);
			param.push(item.DL);
			//dirty
			if(createFromClient) param.push(true);
			else param.push(false);
			//TS
			if(createFromClient) param.push(null);
			else param.push(item.TS);
		});
		sql += rowArgs.join(', ');
		return SQLiteService.Execute(sql,param).then(function(response){return response;},function(error){console.log(error); return error;});
	};
	//***Necessary-Method

	this.GetAll = function(){
		return SQLiteService.Execute("SELECT * FROM news").then(function(response){return response;},function(error){return error;});	
	};
})

//***Test-Sync-Code
.service('TestSyncSQLite',function(SQLiteService){
	//***Necessary-Method
	this.GetLatestTS = function(){
		return SQLiteService.BaseGetLatestTS('testsync').then(function(response){return response;},function(error){return error;});
	};

	this.CountByServerId = function(serverid){
		return SQLiteService.CountByServerId(serverid,'testsync').then(function(response){return response;},function(error){return error;});		
	};

	this.CountIsNotDirtyById = function(id){
		return SQLiteService.CountIsNotDirtyById(id,'testsync').then(function(response){return response;},function(error){return error;});		
	};

	
	this.GetDataByTSIsNull = function(){
		return SQLiteService.GetDataByTSIsNull('testsync');
	};

	this.GetDataIsDirty = function(){
		return SQLiteService.GetDataIsDirty("testsync");
	};

	this.DeleteDataIsFlagDeleted = function(){
		return SQLiteService.DeleteDataIsFlagDeleted("testsync");
	};

	this.Update = function(data,isDirty,clientUpdate){
		var sql;
		if(clientUpdate)
			sql = "UPDATE testsync SET Id = ?, field1 = ?, field2 = ?, field3 = ?,TS = ?, DL = ?, dirty = ? WHERE clientid = " + data.clientid;
		else
			sql = "UPDATE testsync SET Id = ?, field1 = ?, field2 = ?, field3 = ?,TS = ?, DL = ?, dirty = ? WHERE Id = " + data.Id;
		var param = [data.Id,data.field1,data.field2,data.field3,data.TS,data.DL,isDirty];
		return SQLiteService.Execute(sql,param).then(function(response){return response;},function(error){return error;});			
	};

	this.Add = function(data,createFromClient){
		var sql = "INSERT INTO testsync (Id, field1, field2, field3, TS, DL, dirty) VALUES ";
		var param = []; 
		var rowArgs = [];
		data.forEach(function(item){
			rowArgs.push("(?,?,?,?,?,?,?)");
			param.push(item.Id);
			param.push(item.field1);
			param.push(item.field2);
			param.push(item.field3);
			//TS
			if(createFromClient) param.push(null); 
			else param.push(item.TS); 
			//DL
			param.push(item.DL);
			//dirty
			if(createFromClient) param.push(true); 
			else param.push(false);
		});
		sql += rowArgs.join(', ');
		return SQLiteService.Execute(sql,param).then(function(response){return response;},function(error){console.log(error); return error;});
	};
	//***Necessary-Method

	this.DeleteAll = function(){
		return SQLiteService.Execute("DELETE FROM testsync").then(function(response){return response;},function(error){return error;});		
	};

	this.GetAll = function(){
		return SQLiteService.Execute("SELECT * FROM testsync").then(function(response){return response;},function(error){return error;});
	};

	this.GetByClientId = function(clientid){
		return SQLiteService.Execute("SELECT * FROM testsync WHERE clientid = " + clientid).then(function(response){return response;},function(error){return error;});	
	};

	// this.DeleteByServerId = function(serverid){
	// 	return SQLiteService.DeleteByServerId('testsync',serverid).then(function(response){return response;},function(error){return error;});
	// };
})
//***Test-Sync-Code