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

	this.ExecuteDataArray = function(sql,data){
		return $q(function(resolve,reject){
			$cordovaSQLite.execute(db, sql, [data]).then(
				function(response){resolve(response);},
				function(error){reject(error);});
		});
	}

	this.BaseGetLatestTS = function(tablename){
		var sql = "SELECT ts FROM " + tablename + " ORDER BY ts DESC LIMIT 1";
		return this.Execute(sql).then(function(response){
			return (response.rows.length > 0) ? response.rows[0] : null;
		},function(error){});
	};

	this.InitailTables = function(){
		this.CreateUserProfileTable();
		this.CreateMedicalTable();
	};
	this.CreateUserProfileTable = function(){
		$cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS userprofile (userid text, prefixname text, firstname text, lastname text, nickname text, position text, section text, department text, citizenid text, picturepath text,picturethumb text, posi_name_gover text, orga_gover text, changedate text, officetel text, officefax text, mobilephone text, emailaddress text, line text, facebook text,deleted boolean,dirty boolean,ts datetime)");
	};
	this.CreateMedicalTable = function(){
		$cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS medical(id int,empid text, hosptype text, hospname text, patienttype text, family text, patientname text, disease text, total int, docdate text, paiddate text, bankname text, deleted boolean,dirty boolean,ts datetime)");
	};


})
.service('UserProfileSQLite',function(SQLiteService){

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
		return SQLiteService.BaseGetLatestTS('userprofile').then(function(response){return response;},function(error){return error;});
	};

})
.service('MedicalSQLite',function(SQLiteService){

	this.GetLatestTS = function(){
		return SQLiteService.BaseGetLatestTS('medical').then(function(response){return response;},function(error){return error;});
	};

	this.SaveMedical = function(data){
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
	}

	this.GetMedicals = function(){
		return SQLiteService.Execute("SELECT * FROM medical ORDER BY paiddate").then(function(response){return response;},function(error){return error;});
	}

	this.GetDistinctPaidDate = function(){
		return SQLiteService.Execute("SELECT DISTINCT paiddate FROM medical ORDER BY CAST(SUBSTR(paiddate,5,4) AS INT) DESC, CAST(SUBSTR(paiddate,3,2) AS INT) DESC, CAST(SUBSTR(paiddate,1,2) AS INT) DESC").then(function(response){return response;},function(error){return error;});
	}

})