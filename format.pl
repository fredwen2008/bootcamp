#!/usr/bin/env perl
my $jsfiles = `find . -name '*.js'|grep -v node_modules`;
print $jsfiles;
for my $jsfile (split /\n/,$jsfiles){
    if(-f '/tmp/tmp.js'){
        `rm -f /tmp/tmp.js`;
    }
    if(!-f '/tmp/tmp.js'){
        `js-beautify $jsfile >/tmp/tmp.js`;
        if(-f '/tmp/tmp.js'){
            `cp /tmp/tmp.js $jsfile`;
        }else{
            die "error\n";
        }
    }else{
        die "error\n";
    }
}

if(-f '/tmp/tmp.js'){
    `rm -f /tmp/tmp.js`;
}
