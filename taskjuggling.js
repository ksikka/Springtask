var funcstring = 'var idnum = $(this).attr("id"); removeTask(parseInt(idnum)); $("#"+idnum+"task").hide(); ';
//var funcstring2 = 'var idnum=$(this).attr("id"); $("#"+parseInt(idnum)).html(" "); var elem="#"+parseInt(idnum); $(elem).append("<input>"); $(elem+" input").val(tasks[parseInt(idnum)].rawinput);';
var funcstring2 = 'var idnum=$(this).attr("id"); removeTask(parseInt(idnum)); $("#textbox").val(tasks[parseInt(idnum)].rawinput);$("#textbox").focus();';
var highX = '$(this).css("background-color","black"); $(this).css("color","white");';
var restoreX = '$(this).css("background-color","white"); $(this).css("color","black");';

function printTask(task, counter)
{
	var text = task.toString();
	var elem = "#" + task.group;
	elem += " table";	
	$(elem).append('<tr>');
	elem += " tr:last";
	$(elem).append('<td>');
		$(elem + " td:eq(0)").text(toStandardDate(task.date)+" "+toStandardTime(task.date));
		$(elem + " td:eq(0)").css("width","4em");
	$(elem).append('<td>');
		$(elem +" td:eq(1)").text(task.name);
		$(elem +" td:eq(1)").attr("id",counter);
	$(elem ).append('<td>');
		$(elem + " td:eq(2)").html("<span onmouseout = '"+restoreX+"' onmouseover = '"+highX+"'onclick = '"+funcstring+"' class = 'closer' id = '" + counter + "closer'>X</span>");
		$(elem + " td:eq(2)").css("width",".6em");
	$(elem).append('<td>');
	$(elem + " td:eq(3)").html("<span onmouseout = '"+restoreX+"' onmouseover = '"+highX+"'onclick = '"+funcstring2+"' id = '" + counter + "edit' class='editer'>E</span>");
			$(elem + " td:eq(3)").css("width",".6em");
}

function refreshCols()
{
	var numCols = groups.length;
	//	var colWidth= 700/numCols-2;
	var colWidth = 300;
	var entireWidth = numCols*colWidth;
	$('#storage').html(" ");
	$('#storage').css("width",entireWidth+"px");
	
	for(var i = 0; i <numCols; i++)
	{
		$('#storage').append('<div>');
		$('#storage div:nth-child('+(i+1)+')').attr('id', groups[i]);
		$('#storage div:nth-child('+(i+1)+')').append("<b>"+groups[i]+":</b><br />");
	}
	$('#storage div').addClass("col");
	$('#storage div').css("width",colWidth+"px");
	$('#storage .col').append('<table>');
	$('#storage .col table').addClass('tasktable');
	for(var i = 0; i <tasks.length; i++)
	{
		if(tasks[i]!=null)
		printTask(tasks[i],i);
	}
}
		