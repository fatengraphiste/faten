<?php
// Compteur de la page MILS : connexions réussies, mots de passe erronés et avis (1 à 5).
// Tout est enregistré dans data/stats.xml. Lecture : track.php?cle=VOTRE_CLE
declare(strict_types=1);

const CLE_LECTURE = 'A-CHANGER-avant-mise-en-ligne';
const FICHIER = __DIR__ . '/data/stats.xml';

header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

if (!is_dir(dirname(FICHIER))) {
    mkdir(dirname(FICHIER), 0750, true);
    file_put_contents(dirname(FICHIER) . '/.htaccess', "Require all denied\n");
}

function charger(): DOMDocument {
    $doc = new DOMDocument('1.0', 'UTF-8');
    $doc->formatOutput = true;
    if (is_file(FICHIER) && filesize(FICHIER) > 0) {
        $doc->load(FICHIER, LIBXML_NONET);
    } else {
        $root = $doc->appendChild($doc->createElement('mils'));
        $stats = $root->appendChild($doc->createElement('statistiques'));
        foreach (['connexions', 'echecs', 'avis'] as $n) {
            $e = $stats->appendChild($doc->createElement($n));
            $e->setAttribute('total', '0');
        }
        $stats->getElementsByTagName('avis')->item(0)->setAttribute('moyenne', '0');
        $root->appendChild($doc->createElement('evenements'));
    }
    return $doc;
}

// Lecture du fichier par CCA
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!hash_equals(CLE_LECTURE, (string)($_GET['cle'] ?? ''))) { http_response_code(403); exit; }
    header('Content-Type: application/xml; charset=utf-8');
    echo charger()->saveXML();
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }

$in = json_decode((string)file_get_contents('php://input', false, null, 0, 512), true);
$type = is_array($in) ? (string)($in['type'] ?? '') : '';
$note = is_array($in) ? (int)($in['value'] ?? 0) : 0;
if (!in_array($type, ['connexion', 'echec', 'avis'], true) || ($type === 'avis' && ($note < 1 || $note > 5))) {
    http_response_code(400); exit;
}

// verrou : deux visiteurs en même temps n'écrasent pas le fichier
$lock = fopen(FICHIER . '.lock', 'c');
flock($lock, LOCK_EX);
$doc = charger();
$stats = $doc->getElementsByTagName('statistiques')->item(0);
$nom = ['connexion' => 'connexions', 'echec' => 'echecs', 'avis' => 'avis'][$type];
$noeud = $stats->getElementsByTagName($nom)->item(0);
$total = (int)$noeud->getAttribute('total') + 1;
if ($type === 'avis') {
    $moy = (float)$noeud->getAttribute('moyenne');
    $noeud->setAttribute('moyenne', (string)round(($moy * ($total - 1) + $note) / $total, 2));
}
$noeud->setAttribute('total', (string)$total);

$ev = $doc->createElement('evenement');
$ev->setAttribute('type', $type);
if ($type === 'avis') $ev->setAttribute('note', (string)$note);
$ev->setAttribute('date', gmdate('c'));
$doc->getElementsByTagName('evenements')->item(0)->appendChild($ev);
$doc->save(FICHIER);
flock($lock, LOCK_UN);
fclose($lock);
http_response_code(204);
