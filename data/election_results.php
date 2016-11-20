<?php

$conn = mysqli_connect("localhost", "*********", "*********", "*********");

$sql = "select * from election_2016";

$result = mysqli_query($conn, $sql);

$arr = array();
$eligible_voters = 0;
$democrat_votes = 0;
$republican_votes = 0;

while($row = mysqli_fetch_assoc($result)) {
    $data = array();
    foreach ($row as $key => $value) {
        if($key != 'abbreviation') {
            $data[$key] = $value;
        }
        if($key == 'eligible_voters') {
            $eligible_voters = $eligible_voters + $value;
        }
        if($key == 'democrat_votes') {
            $democrat_votes = $democrat_votes + $value;
        }
        if($key == 'republican_votes') {
            $republican_votes = $republican_votes + $value;
        }
    }
    $arr[$row['abbreviation']] = $data;
}

echo json_encode($arr);

?>
