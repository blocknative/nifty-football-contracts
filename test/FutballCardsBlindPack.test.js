const FutballCards = artifacts.require('FutballCards');
const FutballCardsBlindPack = artifacts.require('FutballCardsBlindPack');

const FutballCardsGenerator = artifacts.require('FutballCardsGenerator');

const {BN, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');

contract('FutballCardsBlindPack', ([_, creator, tokenOwner, anyone, ...accounts]) => {

    const firstTokenId = new BN(0);
    const secondTokenId = new BN(1);
    const unknownTokenId = new BN(999);

    const firstURI = 'http://futball-cards';
    const baseURI = 'http://futball-cards';

    before(async function () {
        // Create 721 contract
        this.futballCards = await FutballCards.new(baseURI, {from: creator});

        this.generator = await FutballCardsGenerator.new({from: creator});

        // Create vending machine
        this.blindPack = await FutballCardsBlindPack.new(
            creator,
            this.generator.address,
            this.futballCards.address,
            { from: creator }
        );

        // Add to whitelist
        await this.futballCards.addWhitelisted(this.blindPack.address, {from: creator});
        (await this.futballCards.isWhitelisted(this.blindPack.address)).should.be.true;

        this.basePrice = await this.blindPack.priceInWei();
        this.basePrice.should.be.bignumber.equal('100');

        (await this.futballCards.totalCards()).should.be.bignumber.equal('0');
        (await this.blindPack.totalPurchasesInWei()).should.be.bignumber.equal('0');

        // mint a single building
        const {logs} = await this.blindPack.blindPack({from: tokenOwner, value: this.basePrice});
        expectEvent.inLogs(
            logs,
            `BlindPackPulled`,
            {_tokenId: new BN(0), _to: tokenOwner}
        );
    });

    context('ensure counters are functional', function () {
        it('returns total buildings', async function () {
            (await this.futballCards.totalCards()).should.be.bignumber.equal('1');
        });

        it('returns total purchases', async function () {
            (await this.blindPack.totalPurchasesInWei()).should.be.bignumber.equal(this.basePrice);
        });

        it('has an owner', async function () {
            (await this.futballCards.tokensOfOwner(tokenOwner))[0].should.be.bignumber.equal(firstTokenId);
        });
    });

    context('ensure card has attributes', function () {
        it('returns attributes', async function () {
            const attrs = await this.futballCards.attributesAndName(firstTokenId);

            // between 0 - 99
            attrs[0].should.be.bignumber.lt('100');
            attrs[1].should.be.bignumber.lt('100');
            attrs[2].should.be.bignumber.lt('100');
            attrs[3].should.be.bignumber.lt('100');
            attrs[4].should.be.bignumber.lt('100');
            attrs[5].should.be.bignumber.lt('256');
            attrs[6].should.be.bignumber.lt('256');
        });
    });

    context('ensure card has card values', function () {
        it('returns attributes', async function () {
            const cardAttrs = await this.futballCards.card(firstTokenId);

            // between 0 - 3
            cardAttrs[0].should.be.bignumber.lt('10');
            cardAttrs[1].should.be.bignumber.lt('10');
            cardAttrs[2].should.be.bignumber.lt('10');
            cardAttrs[3].should.be.bignumber.lt('10');
            cardAttrs[4].should.be.bignumber.lt('10');
            cardAttrs[5].should.be.bignumber.lt('10');
        });
    });

    context('ensure only owner can change base price in wei', function () {
        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.blindPack.setPriceInWei(1, {from: tokenOwner}));
        });

        it('should adjust price if owner', async function () {
            const {logs} = await this.blindPack.setPriceInWei(123, {from: creator});
            expectEvent.inLogs(
                logs,
                `PriceInWeiChanged`,
                {_old: new BN(100), _new: new BN(123)}
            );
            (await this.blindPack.priceInWei()).should.be.bignumber.equal('123');
        });
    });

    context('ensure only owner can change attributes base', function () {
        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.blindPack.setAttributesBase(10, {from: tokenOwner}));
        });

        it('should adjust base if owner', async function () {
            const {logs} = await this.blindPack.setAttributesBase(30, {from: creator});
            expectEvent.inLogs(
                logs,
                `AttributesBaseChanged`,
                {_new: new BN(30)}
            );
            (await this.blindPack.attributesBase()).should.be.bignumber.equal('30');
        });
    });

    context('ensure only owner can add credit', function () {
        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.blindPack.addCredit(anyone, {from: tokenOwner}));
        });

        it('should add credit if owner', async function () {
            const {logs} = await this.blindPack.addCredit(anyone, {from: creator});
            expectEvent.inLogs(
                logs,
                `CreditAdded`,
                {_to: anyone}
            );
            (await this.blindPack.credits(anyone)).should.be.bignumber.equal('1');
        });
    });

    context('ensure only owner can change default card type', function () {
        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.blindPack.setCardTypeDefault(2, {from: tokenOwner}));
        });

        it('should add credit if owner', async function () {
            const {logs} = await this.blindPack.setCardTypeDefault(2, {from: creator});
            expectEvent.inLogs(
                logs,
                `DefaultCardTypeChanged`,
                {_new: new BN(2)}
            );
            (await this.blindPack.cardTypeDefault()).should.be.bignumber.equal('2');
        });
    });

    context('ensure only card owner can burn', function () {
        it('should revert if not card owner', async function () {
            await shouldFail.reverting(this.futballCards.burn(firstTokenId, {from: anyone}));
        });

        it('should burn if owner', async function () {
            const {logs} = await this.futballCards.burn(firstTokenId, {from: tokenOwner});
            expectEvent.inLogs(
                logs,
                `Transfer`,
            );
        });
    });

    context('ensure only owner can mint cards', function () {
        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.futballCards.mintCard(1, 1, 1, 1, 1, 1, tokenOwner, {from: tokenOwner}));
        });

        it('should mint and transfer if owner', async function () {
            const {logs} = await this.futballCards.mintCard(1, 1, 1, 1, 1, 1, anyone, {from: creator});
            expectEvent.inLogs(
                logs,
                `CardMinted`,
                {
                    _tokenId: new BN(1),
                    _to: anyone
                }
            );
        });
    });

    context('ensure can not mint with less than minimum purchase value', function () {
        it('should revert if not enough payable', async function () {
            await shouldFail.reverting(this.blindPack.blindPack({
                from: tokenOwner,
                value: 0
            }));
        });
    });

    context('credits', function () {
        it('should fail if no credit and no value', async function () {
            await shouldFail.reverting(this.blindPack.blindPack({
                from: tokenOwner,
                value: 0
            }));
        });

        it('should fulfil if credit and no value', async function () {
            await this.blindPack.addCredit(tokenOwner, {from: creator});
            await this.blindPack.blindPack({from: tokenOwner, value: 0});
        });
    });
});
