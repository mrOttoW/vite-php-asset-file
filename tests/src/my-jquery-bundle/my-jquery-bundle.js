import './my-jquery-bundle.pcss';

/**
 * Some random AI generated jQuery code.
 */
$(document).ready(function () {
  // 1. Change the text of a heading when clicked
  $('h1').click(function () {
    $(this).text('You clicked the heading!');
  });

  // 2. Fade out a paragraph when a button is clicked
  $('button#fadeOutBtn').click(function () {
    $('p').fadeOut();
  });

  // 3. Add a class to an element when mouse hovers over it
  $('div.box').hover(
    function () {
      $(this).addClass('highlight');
    },
    function () {
      $(this).removeClass('highlight');
    }
  );

  // 4. Animate a div to move horizontally
  $('#animateDiv').click(function () {
    $(this).animate(
      {
        left: '+=100px',
        opacity: '0.5',
      },
      500
    );
  });

  // 5. Make an AJAX request to fetch data
  $('#loadDataBtn').click(function () {
    $.ajax({
      url: 'https://jsonplaceholder.typicode.com/posts',
      method: 'GET',
      success: function (data) {
        $('#ajaxData').html('<pre>' + JSON.stringify(data, null, 2) + '</pre>');
      },
      error: function () {
        $('#ajaxData').text('Failed to load data');
      },
    });
  });

  // 6. Toggle visibility of a section
  $('#toggleSectionBtn').click(function () {
    $('#sectionToToggle').toggle();
  });

  // 7. Change the background color of a div
  $('#colorChangeBtn').click(function () {
    $('#colorDiv').css('background-color', '#3498db');
  });

  // 8. Track form input and display live count of characters typed
  $('#textInput').on('input', function () {
    let length = $(this).val().length;
    $('#charCount').text('Character count: ' + length);
  });

  // 9. Scroll to the top of the page when the button is clicked
  $('#scrollTopBtn').click(function () {
    $('html, body').animate({ scrollTop: 0 }, 'slow');
  });

  // 10. Set a timer to automatically hide a message after 3 seconds
  setTimeout(function () {
    $('#autoHideMessage').fadeOut();
  }, 3000);
});
