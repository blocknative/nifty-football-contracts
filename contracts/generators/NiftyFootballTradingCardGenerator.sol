pragma solidity 0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./INiftyFootballTradingCardGenerator.sol";

contract NiftyFootballTradingCardGenerator is Ownable, INiftyFootballTradingCardGenerator {

    uint256 internal randNonce = 0;

    uint256 public constant nameLength = 100;
    uint256 public constant maxAttributeScore = 99;

    // 10% GK, 40% DF, 40% MD, 10% ST
    uint256[] internal positions = [0, 1, 1, 1, 1, 2, 2, 2, 2, 3];

    // Telephone codes
    // 44 ENGLAND 30%
    // 1 USA 30%
    // 39 ITALY 20%
    // 54 ARGENTINA 20%
    uint256[] internal nationalities = [44, 44, 44, 1, 1, 1, 39, 39, 54, 54];

    // 0 - 17 5%
    // 4 - 5 7.5%
    // 16 - 21 2.5%
    uint256[] internal kits = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 17, 18, 19, 20, 21];

    // 0 - 1 2.5%
    // 2 5%
    // 3 2.5%
    // 4 5%
    // 5 20%
    // 6 10%
    // 7 15%
    // 8 20%
    // 9 2.5%
    // 10 - 12 5%
    // 13 - 14 2.5%
    // 15 5%
    // 16 2.5%
    // 17 - 18 5%
    // 19 - 20 2.5%
    // 21 5%
    uint256[] internal colours = [0, 1, 2, 2, 3, 4, 4, 5, 5, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 9, 10, 10, 11, 11, 12, 12, 13, 14, 15, 15, 16, 17, 17, 18, 18, 19, 20, 21, 21];

    // 0 - 4 7%
    // 5 - 19 4%
    // 20 - 24 1%
    uint256[] internal ethnicities = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12, 13, 13, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 21, 22, 23, 24];

    // GREEN #1 40%
    // GREEN #2 40%
    // YELLOW 10%
    // ORANGE 10%
    uint256[] internal gkColours = [0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 3];

    function generateCard(address _sender)
    external
    returns (
        uint256 _nationality,
        uint256 _position,
        uint256 _ethnicity,
        uint256 _kit,
        uint256 _colour
    ) {
        bytes32 hash = blockhash(block.number);
        uint256 position = positions[generate(_sender, positions.length, hash)];
        return (
        nationalities[generate(_sender, nationalities.length, hash)],
        position,
        ethnicities[generate(_sender, ethnicities.length, hash)],
        (position == 0) ? 0 : kits[generate(_sender, kits.length, hash)],
        (position == 0) ? gkColours[generate(_sender, gkColours.length, hash)] : colours[generate(_sender, colours.length, hash)]
        );
    }

    function generateAttributes(address _sender, uint256 _base)
    external
    returns (
        uint256 strength,
        uint256 speed,
        uint256 intelligence,
        uint256 skill
    ) {
        bytes32 hash = blockhash(block.number);
        return (
        _base + generate(_sender, maxAttributeScore - _base, hash),
        _base + generate(_sender, maxAttributeScore - _base, hash),
        _base + generate(_sender, maxAttributeScore - _base, hash),
        _base + generate(_sender, maxAttributeScore - _base, hash)
        );
    }

    function generateName(address _sender)
    external
    returns (
        uint256 firstName,
        uint256 lastName
    ) {
        bytes32 hash = blockhash(block.number);
        return (
        generate(_sender, nameLength, hash),
        generate(_sender, nameLength, hash)
        );
    }

    function allNationalities() public view returns (uint256[] memory) {
        return nationalities;
    }

    function addNationality(uint256 _new) external onlyOwner returns (bool) {
        nationalities.push(_new);
        return true;
    }

    function clearNationalities() external onlyOwner returns (bool) {
        nationalities.length = 0;
        return true;
    }

    function clearNationalityAtIndex(uint256 _index) external onlyOwner returns (bool) {
        uint lastIndex = nationalities.length - 1;
        require(_index <= lastIndex);

        nationalities[_index] = nationalities[lastIndex];
        nationalities.length--;
    }

    function allPositions() public view returns (uint256[] memory) {
        return positions;
    }

    function addPosition(uint256 _new) external onlyOwner returns (bool) {
        positions.push(_new);
        return true;
    }

    function clearPositions() external onlyOwner returns (bool) {
        positions.length = 0;
        return true;
    }

    function clearPositionAtIndex(uint256 _index) external onlyOwner returns (bool) {
        uint lastIndex = positions.length - 1;
        require(_index <= lastIndex);

        positions[_index] = positions[lastIndex];
        positions.length--;
    }

    function allKits() public view returns (uint256[] memory) {
        return kits;
    }

    function addKit(uint256 _new) external onlyOwner returns (bool) {
        kits.push(_new);
        return true;
    }

    function clearKits() external onlyOwner returns (bool) {
        kits.length = 0;
        return true;
    }

    function clearKitAtIndex(uint256 _index) external onlyOwner returns (bool) {
        uint lastIndex = kits.length - 1;
        require(_index <= lastIndex);

        kits[_index] = kits[lastIndex];
        kits.length--;
    }

    function allColours() public view returns (uint256[] memory) {
        return colours;
    }

    function addColour(uint256 _new) external onlyOwner returns (bool) {
        colours.push(_new);
        return true;
    }

    function clearColours() external onlyOwner returns (bool) {
        colours.length = 0;
        return true;
    }

    function clearColourAtIndex(uint256 _index) external onlyOwner returns (bool) {
        uint lastIndex = colours.length - 1;
        require(_index <= lastIndex);

        colours[_index] = colours[lastIndex];
        colours.length--;
    }

    function allEthnicities() public view returns (uint256[] memory) {
        return ethnicities;
    }

    function addEthnicity(uint256 _new) external onlyOwner returns (bool) {
        ethnicities.push(_new);
        return true;
    }

    function clearEthnicities() external onlyOwner returns (bool) {
        ethnicities.length = 0;
        return true;
    }

    function clearEthnicityAtIndex(uint256 _index) external onlyOwner returns (bool) {
        uint lastIndex = ethnicities.length - 1;
        require(_index <= lastIndex);

        ethnicities[_index] = ethnicities[lastIndex];
        ethnicities.length--;
    }

    function generate(address _sender, uint256 _max, bytes32 _hash) internal returns (uint256) {
        randNonce++;
        bytes memory packed = abi.encodePacked(_hash, _sender, randNonce);
        return uint256(keccak256(packed)) % _max;
    }
}
