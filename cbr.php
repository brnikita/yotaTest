<?php
header("Content-type: text/xml");
echo file_get_contents('http://www.cbr.ru/scripts/XML_daily.asp?date_req='.$_GET[date_req]);