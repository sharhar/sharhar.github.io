<html>
	
	<head>
		<title>Login</title>

		<link href="bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css">
		<link rel="stylesheet" href="base.css">
		<script src="jquery-3.1.0.min.js" type="text/javascript"></script>
		<script src="bootstrap/js/bootstrap.min.js" type="text/javascript"></script>
	</head>
	
	<body style="width: 100%; height: 100%;">
		<nav class="navbar navbar-inverse">
			<div class="container-fluid">
				<div class="col-md-2"></div>
				<div class="col-md-8">
				  <div class="navbar-header">
				    <a class="navbar-brand navbar-color" href="#"><img src="favicon.png" style="margin: -5px 0px 0px 0px" width="32px" height="32px" alt=""></a>
				  </div>

				  <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
				    <ul class="nav navbar-nav">
				    	<li><a href="index.html" class="navbar-color">Home</a></li>
				      	<li><a href="projects.html" class="navbar-color">Projects</a></li>
				    </ul>
				  </div>
				</div>
				<div class="col-md-2"></div>
			</div>
		</nav>
		
		<div class="container">
			<div class="col-md-12">
				<div class="col-md-2"></div>
				<div class="col-md-8" id="login">
					<form method="post" action="" style="margin: 15px;" role="form-group">
						<div class="page-header custom-header" style="border-bottom: 1px solid gray; margin: 0px 0px 20px 0px; font-size: 32px;">Login</div>
						
						<p>
							<label for="name">Username:</label>
							<input type="text" name="username"/>
							<br><br>
							<label for="pwd">Password:</label>
							<input type="password" name="pwd" />
						</p>

						<p>
							<button class="btn btn-primary" style="margin: 20px 0px 0px 0px; width: 80px; height: 35px; font-size: 16px;" type="submit" id="submit" value="Login" name="submit">Submit</button>
						</p>
					</form>
				</div>
				<div class="col-md-2"></div>
			</div>
		</div>

		<?php 
		session_start();

		if($_POST) {
			$name = $_POST['username'];
			$pass = $_POST['pwd'];

			$hn = hash("tiger192,4", $name);
			$hp = hash("tiger192,4", $pass);

			$hr = hash("tiger192,4", $hn . $hp);

			$login = fopen("../users.txt", "r") or die("Unable to open file!");
			$file = fread($login,filesize("../users.txt"));
			fclose($login);

			$users = explode(" ", $file);
			$userNum = count($users);

			$valid = False;

			for ($i = 0; $i <= $userNum; $i++) {
		    	if($users[$i] == $hr) {
		    		$valid = True;
		    	}
			}

			if($valid) {
				$_SESSION["in"] = "yes";
				echo '<script>window.location.href = "admin.php";</script>';
			} else {
				$_SESSION["in"] = "no";
				echo "Username or password incorrect!<br> Please retry!";
			}
		}

		if($_SESSION["in"] == "yes") {
			echo '<script>window.location.href = "admin.php";</script>';
		}

		?>
	</body>
</html>