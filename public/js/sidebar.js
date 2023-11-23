$(document).ready(function () {
    $('#sidebarCollapse').on('click', function () {
        console.log('Sidebar toggle button clicked');
        $('#sidebar').toggleClass('active');
        $('#content').toggleClass('active');
        $('.navbar').toggleClass('active');
    });
});
