<html>
	<head>
		<title>Admin</title>

		<link href="base.css" rel="stylesheet" type="text/css">
	</head>

	<body>
		
		<nav>
			<h1>Admin</h1>
			<ul>
				<li><a href="index.html">Home</a></li>
				<li><a href="projects.html">Projects</a></li>
				<li><a href="#">Admin</a></li>
			</ul>
		</nav>

		<?php

		session_start();

		if($_SESSION["in"] == "no" or $_SESSION["in"] == "") {
			echo '<script>window.location.href = "login.php";</script>';
		} else {
			$file = fopen("../comments.txt", "r");
			$comments = fread($file,filesize("../comments.txt"));
			fclose($file);

			$parts = explode(chr(31), $comments);
			$partNum = count($parts);

			if($partNum % 2 != 0) {
				die("Error reading comments.txt file!");
			}

			echo '<h3 style="margin: 10px;">Comments</h3>';

			echo '<div id="commentTable">';
			echo '<table style="width:75%;max-width: 600px;background: white;" border="1">';

			echo '<tr><td width="20%"><strong>Project</strong></td><td width="80%"><strong>Comment</strong></td></tr>';

			for($i = 0;$i < $partNum;$i += 2) {
				echo '<tr><td width="20%">';
				echo $parts[$i];
				echo '</td><td width="80%">';
				echo $parts[$i+1];
				echo '</td></tr>';
			}

			echo "</table>";
			echo "</div>";
		}

		?>
		
		<script>
			function logout() {
				window.location.href = "logout.php";
			}
		</script>

		<button onClick="logout()">
			Logout
		</button>
	</body>
</html>

