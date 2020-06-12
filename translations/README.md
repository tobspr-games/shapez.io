# Translations

The base translation is `base-en.yaml`. It will always contain the latest phrases and structure.

## Languages

-   [English (Base Language, Source of Truth)](base-en.yaml)
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

(If you want to translate into a new language, see below!)

## Editing existing translations

If you want to edit an existing translation (Fixing typos, Updating it to a newer version, etc), you can just use the github file editor to edit the file.

-   Find the file you want to edit (For example, `base-de.yaml` if you want to change the german translation)
-   Click on the file name on, there will be a small "edit" symbol on the top right
-   Do the changes you wish to do (Be sure **not** to translate placeholders!)
-   Click "Propose Changes"
-   I will review your changes and make comments, and eventually merge them so they will be in the next release!

## Adding a new language

Please DM me on discord (tobspr#5407), so I can add the language template for you. It is not as simple as creating a new file.
PS: I'm super busy, but I'll give my best to do it quickly!

## Updating a language to the latest version

Run `yarn syncTranslations` in the root directory to synchronize all translations to the latest version! This will remove obsolete keys and add newly added keys. (Run `yarn` before to install packes).
