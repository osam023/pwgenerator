'use strict';

import * as vscode from 'vscode';

/**
 * Password strength level.
 */
enum Level {
    WEAK,
    NORMAL,
    STRONG
}

/**
 * 
 * 
 * @param context 
 */
export function activate(context: vscode.ExtensionContext) {

    let normalPasswordGenerator = vscode.commands.registerCommand('extension.normalPasswordGenerate', () => {
        vscode.window.showInputBox({
            prompt: '[password length] * [create size]',
            validateInput: param => {
                var regex = /\d+\s*[*]\s*\d+/;
                return regex.test(param) ? '' : 'input: [password length] * [create size]';
            }
        }).then((value) => {
            generate(Level.NORMAL, value);
        });
    });

    let weakPasswordGenerator = vscode.commands.registerCommand('extension.weakPasswordGenerate', () => {
        vscode.window.showInputBox({
            prompt: '[password length] * [create size]',
            validateInput: param => {
                var regex = /\d+\s*[*]\s*\d+/;
                return regex.test(param) ? '' : 'input: [password length] * [create size]';
            }
        }).then((value) => {
            generate(Level.WEAK, value);
        });
    });

    let strongPasswordGenerator = vscode.commands.registerCommand('extension.strongPasswordGenerate', () => {
        vscode.window.showInputBox({
            prompt: '[password length] * [create size]',
            validateInput: param => {
                var regex = /\d+\s*[*]\s*\d+/;
                return regex.test(param) ? '' : 'input: [password length] * [create size]';
            }
        }).then((value) => {
            generate(Level.STRONG, value);
        });
    });

    context.subscriptions.push(weakPasswordGenerator);
    context.subscriptions.push(normalPasswordGenerator);
    context.subscriptions.push(strongPasswordGenerator);
}

export function deactivate() {
}

/**
 * 
 * @param level 
 * @param value 
 */
function generate(level: Level, value): void {
    if (value == undefined) return;
    let length: number = 8;
    let size: number = 1;
    let result = value.match(/(\d+)\s*[*]\s*(\d+)/);
    length = +result[1];
    size = +result[2];
    if (length < 1 || size < 1) return;
    if (length > 64) return;
    if (size > 10000) return;
    placeTextOnEditor(getPasswords(level, length, size));
}

/**
 * generate password text list.
 * 
 * @param level Password strength level.
 * @param length password length.
 * @param size password number of piece
 */
function getPasswords(level: Level, length: number, size: number): string {
    let password: string = "";
    let pwArray: string[] = [];
    for (let index = 0; index < size; index++) {
        var pw = generatePassword(level, length);
        while (hasDuplicate(pw, pwArray)) {
            pw = generatePassword(level, length);
        }
        pwArray.push(pw);
    }
    password = pwArray.join('\n');
    return password;
}

/**
 * generate password text.
 * 
 * @param level Password strength
 * @param length password text length
 */
function generatePassword(level: Level, length: number): string {
    const alphabetLower = 'abcdefghijklmnopqrstuvwxyz';
    const alpahabetUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const symbols = '`~!@#$%^&*()_+-={}|[]\:";\'<>?,./';

    let password: string = '';
    let seeds: string;
    switch (level) {
        case Level.WEAK:
            seeds = alphabetLower + alpahabetUpper;
            break;
        case Level.NORMAL:
            seeds = alphabetLower + alpahabetUpper + digits;
            break;
        case Level.STRONG:
            seeds = alphabetLower + alpahabetUpper + digits + symbols;
            break;
        default:
            break;
    }
    const first: number = 0;
    const last: number = seeds.length;
    for (let index = 0; index < length; index++) {
        let seedIndex: number = Math.floor(Math.random() * (first - last + 1) + last);
        password += seeds.charAt(seedIndex);
    }
    return password;
}

/**
 * 
 * 
 * @param newPassword 
 * @param passwordArray 
 */
function hasDuplicate(newPassword: string, passwordArray: string[]): boolean {
    var hasDuplicate: boolean = false;
    var passwordSets = new Set<string>(passwordArray);
    if (passwordSets.has(newPassword)) {
        hasDuplicate = true;
    }
    return hasDuplicate;
}

/**
 * insert password text to Editor area.
 * 
 * @param generated_string 
 */
export function placeTextOnEditor(generated_string) {
    var editor = vscode.window.activeTextEditor;
    if (!editor) {
        return; // No open text editor
    }

    var selection = editor.selection;
    var text = editor.document.getText(selection);

    editor.edit(function (editBuilder) {
        if (text.length === 0) {
            editBuilder.insert(selection.anchor, generated_string);
        } else {
            editBuilder.replace(selection, generated_string);
        }
    });
}
