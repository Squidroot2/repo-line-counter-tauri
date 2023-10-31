use std::{ffi::OsString, path::Path};

pub trait Rule {
    fn met(&self, path: &Path) -> bool;
}

pub struct ExtRule {
    ext: OsString,
}

impl ExtRule {
    pub fn new(ext: OsString) -> Self {
        ExtRule { ext }
    }
}

impl Rule for ExtRule {
    fn met(&self, path: &Path) -> bool {
        match path.extension() {
            Some(ext) => ext == self.ext,
            None => false,
        }
    }
}

pub trait PathMatcher {
    fn matches(&self, path: &Path) -> bool;
}

pub struct IsMatch<R>
where
    R: Rule,
{
    rule: R,
}

impl<R> IsMatch<R>
where
    R: Rule,
{
    pub fn new(rule: R) -> Self {
        IsMatch { rule }
    }
}

impl<R> PathMatcher for IsMatch<R>
where
    R: Rule,
{
    fn matches(&self, path: &Path) -> bool {
        self.rule.met(path)
    }
}

pub struct BothMatch<R1, R2>
where
    R1: Rule,
    R2: Rule,
{
    rule1: R1,
    rule2: R2,
}

impl<R1, R2> BothMatch<R1, R2>
where
    R1: Rule,
    R2: Rule,
{
    pub fn new(rule1: R1, rule2: R2) -> Self {
        BothMatch { rule1, rule2 }
    }
}

impl<R1, R2> PathMatcher for BothMatch<R1, R2>
where
    R1: Rule,
    R2: Rule,
{
    fn matches(&self, path: &Path) -> bool {
        self.rule1.met(path) && self.rule2.met(path)
    }
}

pub struct AlwaysMatch {}

impl AlwaysMatch {
    pub fn new() -> Self {
        AlwaysMatch {}
    }
}

impl PathMatcher for AlwaysMatch {
    fn matches(&self, _: &Path) -> bool {
        true
    }
}

pub fn ext_matcher(ext: OsString) -> IsMatch<ExtRule> {
    IsMatch::new(ExtRule::new(ext))
}
