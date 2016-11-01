$(function () {
  //disable submit button
  $('#submit').prop('disabled', true);

  //init declarations
  var unOrderedList;

  //onChange import csv
  $("#importCsv").change(handleFileSelect);

  //recreate csv
  function createCsv(json) {
    //todo
  };

  //parse and populate list
  function handleFileSelect(e) {
    var file = e.target.files[0];

    Papa.parse(file, {
      header: true,
      dynamictyping: true,
      complete: function (results) {
        var parsedCsv = results.data[0];
        //console.log(parsedCsv);

        $.each(parsedCsv, function (key, val) {
          $('#pool').append('<li class="list-group-item">' + val + '</li>');          
        });
        //save the state of the unordered list for future reset
        unOrderedList = $("#pool").html();        
      },
      error: function (err) {
        alert(err);
      }
    });
  }(onFileLoaded());

  //if the csv file has changed, clear the previous parsed list
  $('#importCsv').change(function () {
    $('.ordered, .unordered').empty();
    $('.panel-heading').removeClass('valid');
  });

  function onFileLoaded() {
    
    //jquery ui sortable props
    $(".sortable").sortable({
      containment: 'document',
      cursor: 'move',
      connectWith: ".unordered, .ordered",
      delay: '100',
      placeholder: 'list-group-item',
      forcePlaceHolderSize: true,
      revert: 100,
      start: function(event, ui) {

      },
      receive: function (event, ui) {
        var isDataValid = true;
        var id = ($(this).attr('id'));
        var data = $(ui.item).text();
        //check to see if the dragTo slot is already filled
        restrictNumItems();

        //validate zip
        if (id === 'zipcode') {
          if (!isValidZip(data)) {
            $(this).siblings().addClass('invalid');
          }
        };
        //validate first name (no integers)
        if (id === 'firstname') {
          if (!isValidName(data)) {
            $(this).siblings().addClass('invalid');
          }
        };
        //validate last name (no integers)
        if (id === 'lastname') {
          if (!isValidName(data)) {
            $(this).siblings().addClass('invalid');
          }
        };
        //validate city (no integers)
        if (id === 'city') {
          if (!isValidName(data)) {
            $(this).siblings().addClass('invalid');
          }
        };
        //validate state (no integers)
        if (id === 'state') {
          if (!isValidName(data)) {
            $(this).siblings().addClass('invalid');
          }
        };

        //if $this element has a class called invalid, remove valid
        if (!$(this).siblings().hasClass('invalid')) {
          $(this).siblings().addClass('valid');
        } else {
          $(this).siblings().removeClass('valid');
        };

        //enable submit when all elements are valid
        var elementIds = ['#firstname', '#lastname', '#address1', '#address2', '#city', '#state', '#zipcode'];
        var elementsHaveClass = $(elementIds.join()).siblings().filter('.valid');

        if (elementsHaveClass.length == elementIds.length) {
          $('#submit').prop('disabled', false);
        } else {
          $('#submit').prop('disabled', true);
        };
        
      },
      remove: function (event, ui) {        
        //$('*').removeClass('valid');
        $(this).siblings().removeClass('valid');
        $(this).siblings().removeClass('invalid');
      },
      update: function (event, ui) {

      }
    }).disableSelection();
  };//end onFileLoaded

  //onClick reset
  $('#reset').on('click', function () {
    //reload original state of unordered list
    $(".unordered").html(unOrderedList);
    //clear the ordered list
    $(".ordered").html('');
    //refresh the sorted state
    $(".sortable").sortable("refresh");
    //remove organized list heading highlight
    $('.panel-heading').removeClass('valid');
    $('.panel-heading').removeClass('invalid');

    onFileLoaded();
  });

  //while dragging, check to see if ordered data slot is already filled
  function restrictNumItems() {
    //on mouse down, if element already has something in it, disable sortable
    $('.sortable li, panel-body').mousedown(function () {
      $('.sortable').not($(this).parent()).each(function () {
        if ($(this).find('li').length >= 1) {
          if ($(this).attr('id') != "pool") {
            $(this).sortable('disable');
          }
        }
      });
    });
    //on mouse up, enable sortable
    $('.sortable li').mouseup(function () {
      $('.sortable').each(function () {
        $(this).sortable('enable');
      });
    });
  };

  //validation functions
  function isValidZip(zip) {
    return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zip);
  };
  function isValidName(name) {
    return /^([^0-9]*)$/.test(name);
  }

  //onClick Submit
  $('#submit').on('click', function (e) {

    //prevent default form submission to avoid page refresh
    e.preventDefault();

    //extract values from li 
    var firstName = $('#firstname > li').text();
    var lastName = $('#lastname > li').text();
    var address1 = $('#address1 > li').text();
    var address2 = $('#address2 > li').text();
    var city = $('#city > li').text();
    var state = $('#state > li').text();
    var zipcode = $('#zipcode > li').text();

    //payload object key:value binding
    var data = {
      'First Name': firstName,
      'Last Name': lastName,
      'Address Line 1': address1,
      'Address Line 2': address2,
      'City': city,
      'State': state,
      'Zip Code': zipcode
    };

    var csv = Papa.unparse([
      {
        'First Name': firstName,
        'Last Name': lastName,
        'Address Line 1': address1,
        'Address Line 2': address2,
        'City': city,
        'State': state,
        'Zip Code': zipcode
      }
    ]);

    var csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    typeof csvData;
    var csvURL = window.URL.createObjectURL(csvData);
    var tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', 'output_data.csv');
    tempLink.click();

    $.ajax({
      url: url,
      data: csv,
      type: 'POST',
      success: function (data) {
        alert('see console for output')
        console.log(data)
      },
      error: function (data) {
        console.log(data);
      }
    });





    
    console.table(csv);

    //post data to server
    //$.post('@Url.Action("Upload", "Home")', data)
    //  .done(function (response, status, jqxhr) {
        
    //    console.log(response);
    //  })
    //  .fail(function (jqxhr, status, error) {

    //    console.log(error);
    //  });
  });
});


//debugging
//$('.ordered, .unordered').bind('sortreceive', function (event, ui) {
//  console.log(event);
//  console.log(ui);
//});