<?php
try {
    $db = new PDO('sqlite:database.sqlite');
    $stmt = $db->query("SELECT DISTINCT status FROM attendance");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch(Exception $e) {
    echo $e->getMessage();
}
