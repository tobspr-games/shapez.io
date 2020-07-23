# Translations

The base language is English and can be found [here](base-en.yaml).

## Languages

-   [German](base-de.yaml)
-   [French](base-fr.yaml)
-   [Korean](base-kor.yaml)
-   [Dutch](base-nl.yaml)
-   [Polish](base-pl.yaml)
-   [Portuguese (Brazil)](base-pt-BR.yaml)
-   [Portuguese (Portugal)](base-pt-PT.yaml)
-   [Russian](base-ru.yaml)
-   [Greek](base-el.yaml)
-   [Italian](base-it.yaml)
-   [Romanian](base-ro.yaml)
-   [Swedish](base-sv.yaml)
-   [Chinese (Simplified)](base-zh-CN.yaml)
-   [Chinese (Traditional)](base-zh-TW.yaml)
-   [Spanish](base-es.yaml)
-   [Hungarian](base-hu.yaml)
-   [Turkish](base-tr.yaml)
-   [Japanese](base-ja.yaml)
-   [Lithuanian](base-lt.yaml)
-   [Arabic](base-ar.yaml)
-   [Norwegian](base-no.yaml)
-   [Kroatian](base-hr.yaml)
-   [Danish](base-da.yaml)
-   [Finnish](base-fi.yaml)
-   [Catalan](base-cat.yaml)
-   [Slovenian](base-sl.yaml)
-   [Ukrainian](base-uk.yaml)
-   [Indonesian](base-ind.yaml)
-   [Serbian](base-sr.yaml)

(If you want to translate into a new language, see below!)

## Editing existing translations

If you want to edit an existing translation (Fixing typos, Updating it to a newer version, etc), you can just use the github file editor to edit the file.

-   Click the language you want to edit from the list above
-   Click the small "edit" symbol on the top right

<img src="https://i.imgur.com/gZnUQoe.png" alt="edit symbol" width="200">

-   Do the changes you wish to do (Be sure **not** to translate placeholders! For example, `<amount> minutes` should get `<amount> Minuten` and **not** `<anzahl> Minuten`!)

-   Click "Propose Changes"

<img src="https://i.imgur.com/KT9ZFp6.png" alt="propose changes" width="200">

-   Click "Create pull request"

<img src="https://i.imgur.com/oVljvRE.png" alt="create pull request" width="200">

-   I will review your changes and make comments, and eventually merge them so they will be in the next release! Be sure to regulary check the created pull request for comments.

## Adding a new language

Please DM me on Discord (tobspr#5407), so I can add the language template for you.

Please use the following template:

```
Hey, could you add a new translation?

Language: <Language, e.g. 'German'>
Short code: <Short code, e.g. 'de', see below>
Local Name: <Name of your Language, e.g. 'Deutsch'>
```

You can find the short code [here](https://www.science.co.il/language/Codes.php) (In column `Code 2`).

PS: I'm super busy, but I'll give my best to do it quickly!

## Updating a language to the latest version

Run `yarn syncTranslations` in the root directory to synchronize all translations to the latest version! This will remove obsolete keys and add newly added keys. (Run `yarn` before to install packes).
