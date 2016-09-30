<?php 
session_start();
session_unset();
session_destroy(); 
?>

<html>
	<body>
		<script>
			window.location.href = "index.html";
		</script>
	</body>
</html>