const FutballCards = artifacts.require('FutballCards');

const {BN, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');

contract('FutballCards', ([_, creator, tokenOwner, anyone, ...accounts]) => {

    const firstTokenId = new BN(0);
    const secondTokenId = new BN(1);
    const unknownTokenId = new BN(999);

    const firstURI = 'http://futball-cards/';
    const baseURI = 'http://futball-cards/';

    beforeEach(async function () {
        // Create 721 contract
        this.futballCards = await FutballCards.new(baseURI, {from: creator});
        (await this.futballCards.isWhitelisted(creator)).should.be.true;
    });

    context('should mint card', function () {
        it('mints and emits event', async function () {
            const {logs} = await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});
            expectEvent.inLogs(
                logs,
                `CardMinted`,
                {_tokenId: new BN(0), _to: tokenOwner}
            );

            (await this.futballCards.totalCards()).should.be.bignumber.equal('1');
            (await this.futballCards.name()).should.be.equal('FutballCard');
            (await this.futballCards.symbol()).should.be.equal('FUT');
        });
    });

    context('ensure only owner can base URI', function () {
        it('should revert if empty', async function () {
            await shouldFail.reverting(this.futballCards.updateTokenBaseURI('', {from: creator}));
        });

        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.futballCards.updateTokenBaseURI('fc.xyz', {from: tokenOwner}));
        });

        it('should reset if owner', async function () {
            const {logs} = await this.futballCards.updateTokenBaseURI('http://hello', {from: creator});
            expectEvent.inLogs(
                logs,
                `TokenBaseURIChanged`,
                {_new: 'http://hello'}
            );
            (await this.futballCards.tokenBaseURI()).should.be.equal('http://hello');
        });
    });

    context('ensure only owner can base IPFS URI', function () {
        it('should revert if empty', async function () {
            await shouldFail.reverting(this.futballCards.updateTokenBaseIpfsURI('', {from: tokenOwner}));
        });

        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.futballCards.updateTokenBaseIpfsURI('fc.xyz', {from: tokenOwner}));
        });

        it('should reset if owner', async function () {
            const {logs} = await this.futballCards.updateTokenBaseIpfsURI('http://hello', {from: creator});
            expectEvent.inLogs(
                logs,
                `TokenBaseIPFSURIChanged`,
                {_new: 'http://hello'}
            );
            (await this.futballCards.tokenBaseIpfsURI()).should.be.equal('http://hello');
        });
    });

    context('should return correct values', function () {
        it('mints set card values', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            const cardAttrs = await this.futballCards.card(firstTokenId);

            cardAttrs[0].should.be.bignumber.equal('0');
            cardAttrs[1].should.be.bignumber.equal('0');
            cardAttrs[2].should.be.bignumber.equal('0');
            cardAttrs[3].should.be.bignumber.equal('0');
            cardAttrs[4].should.be.bignumber.equal('0');
            cardAttrs[5].should.be.bignumber.equal('0');
        });

        it('set attributes', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            await this.futballCards.setAttributes(firstTokenId, 1, 1, 1, 1, {from: creator});

            const attrsAndName = await this.futballCards.attributesAndName(firstTokenId);
            attrsAndName[0].should.be.bignumber.equal('1');
            attrsAndName[1].should.be.bignumber.equal('1');
            attrsAndName[2].should.be.bignumber.equal('1');
            attrsAndName[3].should.be.bignumber.equal('1');
        });

        it('set attributes must be whitelisted', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            await shouldFail.reverting(this.futballCards.setAttributes(firstTokenId, 1, 1, 1, 1, {from: tokenOwner}));
        });

        it('set attributes must have token', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            await shouldFail.reverting(this.futballCards.setAttributes(unknownTokenId, 1, 1, 1, 1, {from: creator}));
        });

        it('set name', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            await this.futballCards.setName(firstTokenId, 2, 2, {from: creator});

            const attrsAndName = await this.futballCards.attributesAndName(firstTokenId);
            attrsAndName[5].should.be.bignumber.equal('2');
            attrsAndName[6].should.be.bignumber.equal('2');
        });

        it('set name must be whitelisted', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            await shouldFail.reverting(this.futballCards.setName(firstTokenId, 2, 2, {from: tokenOwner}));
        });

        it('set name must have token', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            await shouldFail.reverting(this.futballCards.setName(unknownTokenId, 2, 2, {from: creator}));
        });

        it('set special', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            const {logs} = await this.futballCards.setSpecial(firstTokenId, 3, {from: creator});
            expectEvent.inLogs(
                logs,
                `SpecialSet`,
                {_tokenId: new BN(0), _value: new BN(3)}
            );

            const attrsAndName = await this.futballCards.attributesAndName(firstTokenId);
            attrsAndName[4].should.be.bignumber.equal('3');
        });

        it('set special must be whitelisted', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            await shouldFail.reverting(this.futballCards.setSpecial(firstTokenId, 3, {from: tokenOwner}));
        });

        it('set special must have token', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            await shouldFail.reverting(this.futballCards.setSpecial(unknownTokenId, 3, {from: creator}));
        });
    });

    context('should set extras', function () {

        it('set badge', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            const {logs} = await this.futballCards.setBadge(firstTokenId, 4, {from: creator});
            expectEvent.inLogs(
                logs,
                `BadgeSet`,
                {_tokenId: new BN(0), _value: new BN(4)}
            );

            const extras = await this.futballCards.extras(firstTokenId);
            extras[0].should.be.bignumber.equal('4');
        });

        it('set badge must be whitelisted', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            await shouldFail.reverting(this.futballCards.setBadge(firstTokenId, 4, {from: tokenOwner}));
        });

        it('set badge must have token', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            await shouldFail.reverting(this.futballCards.setBadge(unknownTokenId, 4, {from: creator}));
        });

        it('set sponsor', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            const {logs} = await this.futballCards.setSponsor(firstTokenId, 5, {from: creator});
            expectEvent.inLogs(
                logs,
                `SponsorSet`,
                {_tokenId: new BN(0), _value: new BN(5)}
            );

            const extras = await this.futballCards.extras(firstTokenId);
            extras[1].should.be.bignumber.equal('5');
        });

        it('set sponsor must be whitelisted', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            await shouldFail.reverting(this.futballCards.setSponsor(firstTokenId, 4, {from: tokenOwner}));
        });

        it('set number', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            const {logs} = await this.futballCards.setNumber(firstTokenId, 6, {from: creator});
            expectEvent.inLogs(
                logs,
                `NumberSet`,
                {_tokenId: new BN(0), _value: new BN(6)}
            );

            const extras = await this.futballCards.extras(firstTokenId);
            extras[2].should.be.bignumber.equal('6');
        });

        it('set number must be whitelisted', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            await shouldFail.reverting(this.futballCards.setNumber(firstTokenId, 4, {from: tokenOwner}));
        });

        it('set boots', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            const {logs} = await this.futballCards.setBoots(firstTokenId, 7, {from: creator});
            expectEvent.inLogs(
                logs,
                `BootsSet`,
                {_tokenId: new BN(0), _value: new BN(7)}
            );

            const extras = await this.futballCards.extras(firstTokenId);
            extras[3].should.be.bignumber.equal('7');
        });

        it('set boots must be whitelisted', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            await shouldFail.reverting(this.futballCards.setBoots(firstTokenId, 4, {from: tokenOwner}));
        });

        it('set boots must have token', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            await shouldFail.reverting(this.futballCards.setBoots(unknownTokenId, 4, {from: creator}));
        });

        it('add star', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            const {logs} = await this.futballCards.addStar(firstTokenId, {from: creator});
            expectEvent.inLogs(
                logs,
                `StarAdded`,
                {_tokenId: new BN(0), _value: new BN(1)}
            );

            const extras = await this.futballCards.extras(firstTokenId);
            extras[4].should.be.bignumber.equal('1');
        });

        it('add star must be whitelisted', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            await shouldFail.reverting(this.futballCards.addStar(firstTokenId, {from: tokenOwner}));
        });

        it('add star must have token', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            await shouldFail.reverting(this.futballCards.addStar(unknownTokenId, {from: creator}));
        });

        it('add xp', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            const {logs} = await this.futballCards.addXp(firstTokenId, 99, {from: creator});
            expectEvent.inLogs(
                logs,
                `XpAdded`,
                {_tokenId: new BN(0), _value: new BN(99)}
            );

            const extras = await this.futballCards.extras(firstTokenId);
            extras[5].should.be.bignumber.equal('99');
        });

        it('add xp must be whitelisted', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            await shouldFail.reverting(this.futballCards.addXp(firstTokenId, 4, {from: tokenOwner}));
        });

        it('add xp must have token', async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});

            await shouldFail.reverting(this.futballCards.addXp(unknownTokenId, 4, {from: creator}));
        });
    });

    context('static and dynamic IPFS images', function () {

        const staticIpfsHash = "123-abc-456-def";

        beforeEach(async function () {
            await this.futballCards.mintCard(0, 0, 0, 0, 0, 0, tokenOwner, {from: creator});
            (await this.futballCards.totalCards()).should.be.bignumber.equal('1');
        });

        context('if token owner', function () {
            it('can set static IPFS hash', async function () {
                const {logs} = await this.futballCards.overrideDynamicImageWithIpfsLink(firstTokenId, staticIpfsHash, {from: tokenOwner});
                expectEvent.inLogs(
                    logs,
                    `StaticIpfsTokenURISet`,
                    {
                        _tokenId: firstTokenId,
                        _ipfsHash: staticIpfsHash
                    }
                );
            });

            it('can remove static IPFS hash', async function () {
                await this.futballCards.overrideDynamicImageWithIpfsLink(firstTokenId, staticIpfsHash, {from: tokenOwner});
                const {logs} = await this.futballCards.clearIpfsImageUri(firstTokenId, {from: tokenOwner});
                expectEvent.inLogs(
                    logs,
                    `StaticIpfsTokenURICleared`,
                    {
                        _tokenId: firstTokenId
                    }
                );
            });
        });

        context('if whitelisted', function () {

            beforeEach(async function () {
                await this.futballCards.addWhitelisted(anyone, {from: creator});
                (await this.futballCards.isWhitelisted(anyone)).should.be.true;
            });

            it('cannot set empty hash', async function () {
                await shouldFail.reverting(this.futballCards.overrideDynamicImageWithIpfsLink(firstTokenId, '', {from: anyone}));
            });

            it('can set static IPFS hash', async function () {
                const {logs} = await this.futballCards.overrideDynamicImageWithIpfsLink(firstTokenId, staticIpfsHash, {from: anyone});
                expectEvent.inLogs(
                    logs,
                    `StaticIpfsTokenURISet`,
                    {
                        _tokenId: firstTokenId,
                        _ipfsHash: staticIpfsHash
                    }
                );
            });

            it('can remove static IPFS hash', async function () {
                await this.futballCards.overrideDynamicImageWithIpfsLink(firstTokenId, staticIpfsHash, {from: anyone});
                const {logs} = await this.futballCards.clearIpfsImageUri(firstTokenId, {from: anyone});
                expectEvent.inLogs(
                    logs,
                    `StaticIpfsTokenURICleared`,
                    {
                        _tokenId: firstTokenId
                    }
                );
            });
        });

        context('if not whitelisted', function () {
            it('cannot set static IPFS hash', async function () {
                await shouldFail.reverting(this.futballCards.overrideDynamicImageWithIpfsLink(firstTokenId, staticIpfsHash, {from: anyone}));
            });

            it('cannot remove static IPFS hash', async function () {
                await this.futballCards.overrideDynamicImageWithIpfsLink(firstTokenId, staticIpfsHash, {from: tokenOwner});
                await shouldFail.reverting(this.futballCards.clearIpfsImageUri(firstTokenId, {from: anyone}));
            });
        });

        context('when calling tokenURI()', function () {

            it('will use static IPFS hash if found', async function () {
                await this.futballCards.overrideDynamicImageWithIpfsLink(firstTokenId, staticIpfsHash, {from: tokenOwner});
                const tokenURI = await this.futballCards.tokenURI(firstTokenId);
                tokenURI.should.be.equal("https://ipfs.infura.io/ipfs/123-abc-456-def");
            });

            it('will go back to using dynamic  URI if static set and then cleared', async function () {
                await this.futballCards.overrideDynamicImageWithIpfsLink(firstTokenId, staticIpfsHash, {from: tokenOwner});
                const newTokenURI = await this.futballCards.tokenURI(firstTokenId);
                newTokenURI.should.be.equal("https://ipfs.infura.io/ipfs/123-abc-456-def");

                await this.futballCards.clearIpfsImageUri(firstTokenId, {from: tokenOwner});
                const resetTokenURI = await this.futballCards.tokenURI(firstTokenId);
                resetTokenURI.should.be.equal("http://futball-cards/0");
            });
        });

    });
});
