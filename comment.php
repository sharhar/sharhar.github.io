<html>

<head>
	<title>Comment Page</title>

	<link href="bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css">
		<link rel="stylesheet" href="base.css">
		<script src="jquery-3.1.0.min.js" type="text/javascript"></script>
		<script src="bootstrap/js/bootstrap.min.js" type="text/javascript"></script>
</head>


<body>
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
		    <ul class="nav navbar-nav navbar-right">
		      	<li><a href="login.php" class="navbar-color">Login</a></li>
		    </ul>
		  </div>
		</div>
		<div class="col-md-2"></div>
	</div>
</nav>
	
	<div class="container">
		<div class="col-md-12">
			<div class="col-md-1"></div>
			<div class="col-md-10" id="comment">	
				<form action="" method="post" style="margin: 10px">
					<h2>Comment</h2>

					<div id="commentInfo">
						These comments are supposed to be used like the issues tab on github. 
						They should be used for reporting bugs or submiting ideas for new features. 
					</div><br>
					
					<p>
						<label for="project">Project:</label>
						<input type="text" name="project" />
					</p>

					<p>
						<label for="comment">Comment:</label>
						<br>
						<textarea type="text" name="comment" ></textarea>
					</p>

					<button type="submit" id="submit" value="Login" name="submit" style="width: 100px; height: 40px;">Submit</button>
				</form>
			</div>
			<div class="col-md-1"></div>
		</div>
	</div>

		<?php

		if($_POST) {
			$project = $_POST['project'];
			$comment = $_POST['comment'];

			$file = "../comments.txt";

			$append = chr(31) . $project . chr(31) . $comment;

			file_put_contents($file, $append, FILE_APPEND | LOCK_EX);

			echo "Submited comment!";
		}

		?>
	</div>

</body>

</html>
