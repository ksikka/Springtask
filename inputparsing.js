/**
 * Reads inputs from the text box
 * Parses tasks and deadlines
 * Stores them in a schema
 * Can return them in strings
 */

var magicOutputBox;
var TestVar;
var wordsOfWisdom;
var indexOfBy;
var doesByExist;
var isByLastWord;
var isByMiddleWord;
//keywords 
var bySyn = new Array("by","for","at","on");
//relative days
var todaySyn = new Array("today","tday");
var tmroSyn = new Array("tomorrow","tmro", "tomr", "tmrw", "tmrow");
//absolute days
var mondaySyn = new Array("monday", "mon");
var tuesdaySyn = new Array("tuesday","tues");
var wednesdaySyn = new Array("wednesday","wed");
var thursdaySyn = new Array("thursday","thurs");
var fridaySyn = new Array("friday","fri");
var saturdaySyn = new Array("saturday","sat");
var sundaySyn = new Array("sunday","sun");
var preSetDayArray = new Array(sundaySyn, mondaySyn, tuesdaySyn, wednesdaySyn, thursdaySyn, fridaySyn, saturdaySyn);
var thisDayArray = new Array(7); thisDayArray = initDayArray(thisDayArray);
var indexOfHashTag;

function validate(form)
{
	var task = new Task("",new Date(),"misc");
	//get the string, break down into words
	var rawinput;
	if(!(form instanceof Element))
	{
		rawinput = form;
		TestVar = form;
	}
	else{
	rawinput = form.inputbox.value;
	TestVar = form.inputbox.value; }
	
	wordsOfWisdom = getWords(TestVar);
	//finding keyword "by"
	indexOfBy = findWords(bySyn, wordsOfWisdom);
	doesByExist = indexOfBy != -1;
	isByLastWord = doesByExist&&(indexOfBy == (wordsOfWisdom.length-1));
	isByMiddleWord = doesByExist&&(!isByLastWord)&&(indexOfBy!=0);
	//taking action based on the keywords
	var date=null;
	var dateString = "by ";
	var name = "";
	if(isByLastWord||isByMiddleWord)
	{
		if(isByMiddleWord) // if so, separate datetime
		{
			//generate string of words after by
			var rawDateString = "";
			for(var i = indexOfBy + 1; i < wordsOfWisdom.length; i++) rawDateString += wordsOfWisdom[i] + " ";

		//search for date and time

		date = parseDateString(rawDateString);
			//convert the date into a readable string
			dateString += toStandardDate(date) + ", " + toStandardTime(date);

	}
	}
	
	indexOfHashTag = -1;
	var groupName = parseGroup(wordsOfWisdom);
	var hashExist = (indexOfHashTag == -1) ? false : true;
	
	
	//name the task, all words before by
	var nameEnds = indexOfBy;
	if (indexOfBy == -1) nameEnds = wordsOfWisdom.length;
	//recompile the words of the name
	for (var i =0 ; i < nameEnds; i++)
	{
		if(i == indexOfHashTag) continue;
		name += wordsOfWisdom[i] + " ";
	}
	var dateGiven = true;
	//make a task
	if(date == null) {
	date = new Date(); dateGiven = false; }
	
	task = new Task (name, date, "misc");
	if(hashExist) task = new Task (name, date, groupName);
	task.dateGiven = dateGiven;
	task.groupGiven = hashExist;
	
	//generate string output of task (eventually will be a toString
	TestVar = "";
	if(hashExist) TestVar += task.group + ": ";
	if(dateString == "by ") dateString = "";
	TestVar += task.name + dateString;
	
	magicOutputBox = document.getElementById("formresults");
	magicOutputBox.innerHTML=TestVar;
	
	task.rawinput = rawinput;
	
	return task;
}
function parseGroup(words)
{
	var indexOfHashWords = new Array();
	for(var i =0 ; i < words.length ; i++)
	{
		if(words[i].charAt(0) == '#') indexOfHashWords.push(i);
	}
	indexOfHashTag = (indexOfHashWords.length > 0) ? indexOfHashWords[indexOfHashWords.length-1] : -1;
	if(indexOfHashTag == -1) return null;
	if(indexOfHashWords.length > 1) return "Error: you may only use one hash tag.";

	var group = words[indexOfHashTag];

	return group.substr(1,group.length);

}



function getNumDaysAfter(day)
{
	today = (new Date()).getDay();
	if (day < today) day += 7;
	return day - today;
}
function parseDateOnly(rawDateOnly)
{
	var wordsOfWisdom = getWords(rawDateOnly);
	var date = new Date();
	var numDaysAfter = 0;
	var msms = date.getTime();
	var numMsDay = 86400000 ;
		//today
	var indexOfToday = findWords(todaySyn,wordsOfWisdom);
	var doesTodayExist = indexOfToday > -1;
	if(doesTodayExist) return new Date(msms);
		//tmro
	var indexOfTmro = findWords(tmroSyn,wordsOfWisdom);
	var doesTmroExist = indexOfTmro > -1 ;
	if(doesTmroExist) return new Date(msms+numMsDay);
		//other days
	var goesIntoIfBlock = false;
	for(var i = 0; i < 7; i++)
	{
		if(findWords(thisDayArray[i],wordsOfWisdom) != -1)
		{
			numDaysAfter = i;
			goesIntoIfBlock = true;
		}
	}
	if(goesIntoIfBlock) return new Date(msms + numMsDay*numDaysAfter);
	
	var indexOfDateNumber = new Array();
	for(var i = 0; i < wordsOfWisdom.length; i++)
		if(!isNaN(parseInt( wordsOfWisdom[i].charAt(0) )))
			if(isValidNumDate(wordsOfWisdom[i]))
				indexOfDateNumber.push(i);
	if(indexOfDateNumber.length==0) return date;

	var dashDotDate = wordsOfWisdom[indexOfDateNumber[0]];
	dashDotDate = dashDotDate.replace("/"," ");
	dashDotDate = dashDotDate.replace("."," ");
	thoseNums = getWords(dashDotDate);
	date.setMonth(parseInt(thoseNums[0])-1);
	date.setDate(parseInt(thoseNums[1]));
	
	return date;	
}

//checks if the string is a time or not...

function parseTimeOnly(timeString) 
{
	var rawWords = getWords(timeString);
	var essentialIndex = 0;
	for(var i = 0; i < rawWords.length; i++)
	{
		if(isATime(rawWords[i])) essentialIndex = i;
	}
	timeString = rawWords[ essentialIndex ];
	
	var time = new Date();
	
	var bannedTimeChars = new Array('.','/','-');
	for(var i = 0; i < timeString.length; i++)
	{
		for(var j = 0; j < bannedTimeChars.length; j++)
		{
			if(timeString.charAt(i) == bannedTimeChars[j]) return time;
		}
	}
	
	timeString = timeString.replace(":"," ");
	timeString = timeString.replace("p"," P");
	timeString = timeString.replace("P"," P");
	timeString = timeString.replace("a"," A");
	timeString = timeString.replace("A"," A");
	
	
	var thoseNums = getWords(timeString);
	var numTerms = thoseNums.length;
	if(numTerms > 3) return time;
	if(isNaN(parseInt(thoseNums[0]))) return time;
	
	var isItPM = (time.getHours()>11) ? true : false;
	if(parseInt(thoseNums[0])>12) return time;
	else
	{
		if(time.getHours()%12 > parseInt(thoseNums[0]))
		{
			time.setHours(parseInt(thoseNums[0]),0);
			if(!isItPM)
			time.setTime(time.getTime() + 1000*60*60*12);
		}
		else time.setHours(parseInt(thoseNums[0]),0);
	}
	if(numTerms == 1)
	{
		return time;
	}// number is alone, represents hours
	var checkAMPM = new Array("pm","am");
	var indexAMPM = findWords(checkAMPM, thoseNums);
	
	if(isNaN(thoseNums[1]))//if the second term is not a number
	{
		if(indexAMPM != 1) return time;
		else //check am or pm, and force it
		{
			var isPM = (thoseNums[1].toUpperCase() == "PM") ? true :false;
			if(isPM)
			{
				if(time.getHours() < 12)
				{
					time.setHours(time.getHours()+12,0);
				}
			}
			else
			{
				if(time.getHours()>12)
				time.setHours(time.getHours() - 12,0);
		}
			return time;
		}
	}
			// if its not am or pm, return false
	else 
	{
		if(parseInt(thoseNums[1]>59)) return time;//	else the second term, parsed, should not be greater than 60
		else	time.setMinutes(parseInt(thoseNums[1]));
	}
	
	if (numTerms == 3)//	if there is a third term
	{
		if(indexAMPM != 2) return time;//if its not am or pm return false
		else
		{
			var isPM = (thoseNums[2].toUpperCase() == "PM") ? true :false;
			if(isPM)
			{
				if(time.getHours() < 12)
				{
					time.setHours(time.getHours()+12, time.getMinutes());
				}
			}
			else
			{
				if(time.getHours()>12)
				time.setHours(time.getHours() - 12, time.getMinutes());
			}
		}
	}
	return time;
}

function isATime(timeString)
{
	timeString = timeString.replace(":"," ");
	timeString = timeString.replace("p"," P");
	timeString = timeString.replace("P"," P");
	timeString = timeString.replace("a"," A");
	timeString = timeString.replace("A"," A");
	var time = new Date();
	var thoseNums = getWords(timeString);
	var numTerms = thoseNums.length;
	if(numTerms > 3) return false;
	if(isNaN(parseInt(thoseNums[0]))) return false;
	
	var isItPM = (time.getHours()>11) ? true : false;
	if(parseInt(thoseNums[0])>12) return false;
	else
	{
		return true;
	}
	if(numTerms == 1)
	{
		return true;
	}// number is alone, represents hours
	var checkAMPM = new Array("pm","am");
	var indexAMPM = findWords(checkAMPM, thoseNums);
	
	if(isNaN(thoseNums[1]))//if the second term is not a number
	{
		if(indexAMPM != 1) return false;
		else //check am or pm, and force it
		{
			return true;
		}
	}
			// if its not am or pm, return false
	else 
	{
		if(parseInt(thoseNums[1]>59)) return false;//	else the second term, parsed, should not be greater than 60
		else	return true;
	}
	
	if (numTerms == 3)//	if there is a third term
	{
		if(indexAMPM != 2) return false;//if its not am or pm return false
		else
		{
			return true;
		}
	}
	return true;
}

function isValidNumDate(dateString)
{
	var numberAlone = true;
	for(var i = 0; i < dateString.length; i++)
	{
		if(isNaN(parseInt(dateString.charAt(i)))&&((dateString.charAt(i) != '/')&&(dateString.charAt(i) != '.'))) return false;
		if(isNaN(parseInt(dateString.charAt(i)))) numberAlone=false;
	}
	if(numberAlone) return false;
	dateString = dateString.replace("/"," ");
	dateString = dateString.replace("."," ");
	var thoseNums = getWords(dateString);
	if(thoseNums.length < 2) return false;
	if(thoseNums[0].length < 2)
	{
		if((parseInt(thoseNums[0]) > 12)||(parseInt(thoseNums[0]) <1))
			return false;
		if((parseInt(thoseNums[1]) > 31)||(parseInt(thoseNums[1]) <1))
			return false;
	}
	return true;
}

function parseDateString(rawDateString)
{
	var date = parseDateOnly(rawDateString);
	var time = parseTimeOnly(rawDateString);	
	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), time.getSeconds());
}
function Task(name, date, group)
{
	this.name = name;
	this.rawinput = "";
	this.date = date;
	this.group = group.toLowerCase();
	this.id=0;
	this.dateGiven = true;
	this.groupGiven = true;
	this.groupID = -1;
	this.toString = function() {
		var stringythingy="";
		/*if(this.groupGiven)
			stringythingy += this.group + ": ";*/
		stringythingy += this.name;
		if(this.dateGiven) {
		stringythingy += " on " + toStandardDate(this.date);
		stringythingy += " at " + toStandardTime(this.date); }
		return stringythingy;
	}
}

function toStandardTime(dateObj)
{
	if(dateObj == null) return "";
	var hours = dateObj.getHours();
	//false if am, true if pm
	var ampm = false;
	if(hours>11)
	{
		ampm = true;
		hours -=12;

	}
			if(hours==0) hours = 12;
	var minutes = dateObj.getMinutes();
	if(minutes<10) minutes = "0" + minutes;
	ampm = (ampm) ? "PM" : "AM";
	return hours + ":" + minutes + " " + ampm;
}

function toStandardDate(dateObj)
{
var dumb = dateObj.getMonth() + 1;
return dumb +"/"+dateObj.getDate()+"/"+11;
}

//returns -1 if theres no "word". returns index of word if "word" is there
function findWord(word,wordArray)
{
	var holder = -1;
	for(var i =0; i< wordArray.length; i++)
		if(wordArray[i].toUpperCase()==word.toUpperCase())
			holder = i;
	return holder;
}

function findWords(words,wordArray)
{
	//var holder = new PairOfNumbers(-1,-1);
	var holder = -1;
	for(var i =0; i< wordArray.length; i++)
		for(var j = 0; j < words.length; j++)
			if(wordArray[i].toUpperCase()==words[j].toUpperCase())
				//holder = new PairOfNumbers(i,j);
				holder = i;
	return holder;
}

function addColor(inputString, color)
{
	return "<span style='color:" + color + "'>" + inputString + "</span>";
}

function getWords(inputString)
{
	var zeros = new Array();
	zeros[0] = -1;
	var zeroCounter = 1;
	for(var i = 0; i < inputString.length; i++)
		if(inputString.charAt(i)==' ')
			zeros[zeroCounter++] = i;
	zeros[zeroCounter] = inputString.length;
	var words = new Array();
	var wordCounter = 0;
	for(var i = 0; i < zeroCounter; i++)
		if((zeros[i+1]-zeros[i])>1)
			words[wordCounter++] = inputString.substring(zeros[i]+1,zeros[i+1]);		
	return words;
}
function initDayArray(dayArray)
{
	var todayIndex = (new Date()).getDay();
	var dummyI = todayIndex;
	for(var i  = 0; i < 7; i++)
	{
		dummyI = dummyI % 7;
		dayArray[i] = preSetDayArray[dummyI++];
	}
	return dayArray;
}